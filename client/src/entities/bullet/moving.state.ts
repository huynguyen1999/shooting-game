import { IState } from "../../abstract";

export class MovingState extends IState {
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): MovingState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}

    public onEnter(args: any): void {}

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return "moving_bullet";
    }
    public draw(context: CanvasRenderingContext2D) {}
    public getCoolDownTime(): number {
        return 0;
    }
}
