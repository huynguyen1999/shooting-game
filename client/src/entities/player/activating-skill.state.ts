import { IState } from "../../abstract";
import { STATE_KEYS } from "../../constants";

export class ActivatingSkillState extends IState {
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): ActivatingSkillState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}

    public onEnter(args: any): void {}

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return STATE_KEYS.PLAYER.ACTIVATING_SKILL;
    }
    public draw(context: CanvasRenderingContext2D) {
        context.fillText(
            "Rasengan!",
            this.owner.x,
            this.owner.y - this.owner.radius - 20,
        );
    }
    public getCoolDownTime(): number {
        return 500;
    }
}
