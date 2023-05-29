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
    public abstract draw(context: CanvasRenderingContext2D): void;
}

export class StateMachine {
    private static readonly InvalidState: string = "Invalid";
    private stateCache: Record<string, IState> = {};
    private currentState: IState | null;
    private lastState: IState | null;
    private globalState: IState | null;
    private owner: any;

    private change_state_queue: IState[] = [];
    private is_changing_state = false;

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

    public registerState(key: string, state: IState): StateMachine {
        this.stateCache[key] = state;
        return this;
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
        if (key === this.getCurrentState()) {
            console.log("State has no change");
            return;
        }
        const newState: IState | undefined = this.stateCache[key];
        if (!newState) {
            console.error(`Unregistered state type: ${key}`);
            return;
        }
        if (this.is_changing_state) {
            this.change_state_queue.push(newState);
            return;
        }
        this.is_changing_state = true;
        if (this.currentState) {
            this.currentState.onLeave(newState.getStateKey());
        }

        this.lastState = this.currentState;
        this.currentState = newState;
        this.currentState.setOwner(this.owner);
        this.currentState.onEnter(args);
        this.is_changing_state = false;
    }

    public update(deltaTime: number): void {
        if (this.globalState) {
            this.globalState.onUpdate(deltaTime);
        }
        if (this.currentState) {
            this.currentState.onUpdate(deltaTime);
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
