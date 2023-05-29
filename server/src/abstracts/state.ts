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

  public abstract onUpdate(): void;

  public abstract onLeave(stateKey: string): void;

  public abstract getStateKey(): string;
}

export class StateMachine {
  private static readonly InvalidState: string = 'Invalid';
  private stateCache: Record<string, IState> = {};
  private currentState: IState | null;
  private lastState: IState | null;
  private globalState: IState | null;
  private owner: any;

  constructor(owner: any) {
    this.owner = owner;
    this.currentState = null;
    this.lastState = null;
    this.globalState = null;
  }

  public isExist(stateKey: string): boolean {
    return this.stateCache?.[stateKey] !== undefined;
  }

  public getStateByKey(stateKey: string): IState | undefined {
    return this.stateCache?.[stateKey];
  }

  public setOwner(owner: any): StateMachine {
    this.owner = owner;
    return this;
  }

  public registerState(key: string, state: IState): void {
    this.stateCache[key] = state;
  }

  public setGlobalState(state: IState, args: any = {}): StateMachine {
    this.globalState = state;
    this.globalState.setOwner(this.owner);
    this.globalState.onEnter(args);
    return this;
  }

  public removeState(id: number): void {
    delete this.stateCache[id];
  }

  public changeState(key: string, args: any = {}): void {
    const newState: IState | undefined = this.stateCache[key];
    if (!newState) {
      console.error(`Unregistered state type: ${key}`);
      return;
    }

    if (this.currentState) {
      this.currentState.onLeave(newState.getStateKey());
    }

    this.lastState = this.currentState;
    this.currentState = newState;
    this.currentState.setOwner(this.owner);
    this.currentState.onEnter(args);
  }

  public update(): void {
    if (this.globalState) {
      this.globalState.onUpdate();
    }
    if (this.currentState) {
      this.currentState.onUpdate();
    }
  }

  public getCurrentState(): string {
    if (this.currentState) {
      return this.currentState.getStateKey();
    }
    return StateMachine.InvalidState;
  }

  public clear(): void {
    if (this.currentState) {
      this.currentState.onLeave(StateMachine.InvalidState);
    }
    this.stateCache = {};
    this.currentState = null;
    this.lastState = null;
  }
}
