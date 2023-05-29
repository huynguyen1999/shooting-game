import { Direction } from "../../client/commands";
import { PlayerState } from "./player.state";

export class IdleState extends PlayerState {
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): IdleState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}

    public onEnter(args: any): void {}

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return "idle_player";
    }
    public move(direction: Direction, deltaTime: number): void {}
    public shoot() {}
    public draw(context: CanvasRenderingContext2D) {}
}
