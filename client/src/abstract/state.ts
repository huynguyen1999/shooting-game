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
    public abstract getCoolDownTime(): number;
    public abstract draw(context: CanvasRenderingContext2D, ...args: any): void;

    public isForced() {
        return false;
    }
}

export class StateMachine {
    private static readonly InvalidState: string = "Invalid";
    private states!: Map<string, IState>;
    private current_state: IState | null = null;
    private owner: any;

    private change_state_queue: IState[] = [];
    private is_changing_state = false;
    private last_state_change_time: number;
    private default_state: IState | null = null;

    constructor(owner: any) {
        this.owner = owner;
        this.states = new Map<string, IState>();
        this.last_state_change_time = Date.now();
    }

    public isExist(stateKey: string): boolean {
        return this.states.has(stateKey);
    }

    public getStateByKey(stateKey: string): IState | undefined {
        return this.states.get(stateKey);
    }
    public setDefaultState(stateKey: string) {
        this.default_state = this.states.get(stateKey) as IState;
        return this;
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
    private forceChangeState(newState: IState, args: any = {}) {
        if (this.current_state) {
            this.current_state.onLeave(newState.getStateKey());
        }
        this.current_state = newState;
        this.current_state.setOwner(this.owner);
        this.current_state.onEnter(args);
        this.change_state_queue = [];
        this.is_changing_state = false;
    }
    public changeState(key: string, args: any = {}): void {
        const newState: IState | undefined = this.states.get(key);
        if (!newState) {
            console.error(`Unregistered state type: ${key}`);
            return;
        }

        if (newState.isForced()) {
            this.forceChangeState(newState, args);
            return;
        }
        // if state has cooldown
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.last_state_change_time;
        const coolDownTime = this.current_state?.getCoolDownTime() as number;
        const timeLeft = coolDownTime - elapsedTime;

        if (coolDownTime && elapsedTime < coolDownTime) {
            // console.log(
            //     `${
            //         this.owner.constructor.name
            //     }: ${this.current_state?.getStateKey()}'s in progress, ${timeLeft}ms left then you can switch to ${newState.getStateKey()} yet!`,
            // );
            return;
        }
        if (this.is_changing_state) {
            this.change_state_queue.push(newState);
            return;
        }
        if (key === this.getCurrentStateKey()) {
            this.current_state?.onReEnter(args);
            return;
        }
        this.is_changing_state = true;
        if (this.current_state) {
            this.current_state.onLeave(newState.getStateKey());
        }
        // console.log(
        //     `${
        //         this.owner.constructor.name
        //     } new state: ${newState.getStateKey()}`,
        // );
        this.current_state = newState;
        this.last_state_change_time = Date.now();
        this.current_state.setOwner(this.owner);
        this.current_state.onEnter(args);
        this.is_changing_state = false;
    }

    public update(deltaTime: number): void {
        if (this.current_state?.getCoolDownTime() !== 0 && this.default_state) {
            this.changeState(this.default_state.getStateKey());
        }
        if (!this.is_changing_state && this.change_state_queue.length > 0) {
            const pendingState = this.change_state_queue.shift() as IState;
            this.changeState(pendingState.getStateKey());
            return;
        }

        if (this.current_state && this.current_state.onUpdate) {
            this.current_state.onUpdate(deltaTime);
        }
    }

    public getCurrentStateKey(): string {
        if (this.current_state) {
            return this.current_state.getStateKey();
        }
        return StateMachine.InvalidState;
    }
    public getCurrentState(): IState | null {
        return this.current_state;
    }

    public clear(): void {
        if (this.current_state) {
            this.current_state.onLeave(StateMachine.InvalidState);
        }
        this.states.clear();
        this.current_state = null;
    }
}
