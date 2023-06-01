export abstract class IState {
  protected owner: any;

  public getOwner(): any {
    return this.owner;
  }
  public setOwner(owner: any): IState {
    this.owner = owner;
    return this;
  }
  public abstract onReEnter(args: any): void;

  public abstract onEnter(args: any): void;

  public abstract onUpdate(deltaTime: number): void;

  public abstract onLeave(stateKey: string): void;

  public abstract getStateKey(): string;
}

export class StateMachine {
  private static readonly InvalidState: string = 'Invalid';
  private states!: Map<string, IState>;
  private current_state: IState | null = null;
  private owner: any;

  private change_state_queue: IState[] = [];
  private is_changing_state = false;

  constructor(owner: any) {
    this.owner = owner;
    this.states = new Map<string, IState>();
  }

  public isExist(stateKey: string): boolean {
    return this.states.has(stateKey);
  }

  public getStateByKey(stateKey: string): IState | undefined {
    return this.states.get(stateKey);
  }

  public setOwner(owner: any): StateMachine {
    this.owner = owner;
    return this;
  }

  public registerState(key: string, state: IState): StateMachine {
    this.states.set(key, state);
    return this;
  }
  public removeState(key: string): void {
    this.states.delete(key);
  }

  public changeState(key: string, args: any = {}): void {
    if (key === this.getCurrentState()) {
      return;
    }
    const newState: IState | undefined = this.states.get(key);
    if (!newState) {
      console.error(`Unregistered state type: ${key}`);
      return;
    }
    if (this.is_changing_state) {
      this.change_state_queue.push(newState);
      return;
    }
    this.is_changing_state = true;
    if (this.current_state) {
      this.current_state.onLeave(newState.getStateKey());
    }

    this.current_state = newState;
    this.current_state.setOwner(this.owner);
    this.current_state.onEnter(args);
    this.is_changing_state = false;
  }

  public update(deltaTime: number): void {
    if (this.change_state_queue.length > 0) {
      const pendingState = this.change_state_queue.shift() as IState;
      this.changeState(pendingState.getStateKey());
      return;
    }
    if (this.current_state && this.current_state.onUpdate) {
      this.current_state.onUpdate(deltaTime);
    }
  }

  public getCurrentState(): string {
    if (this.current_state) {
      return this.current_state.getStateKey();
    }
    return StateMachine.InvalidState;
  }

  public clear(): void {
    if (this.current_state) {
      this.current_state.onLeave(StateMachine.InvalidState);
    }
    this.states.clear();
    this.current_state = null;
  }
}
