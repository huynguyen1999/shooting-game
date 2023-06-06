import { IState } from "../../abstract";
import { STATE_KEYS } from "../../constants";

export class OnCoolDownState extends IState {
    private start_timer!: number;
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): OnCoolDownState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}

    public onEnter(args: any): void {
        this.start_timer = Date.now();
    }

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return STATE_KEYS.SKILL.ON_COOL_DOWN;
    }
    public draw(context: CanvasRenderingContext2D) {}
    public getCoolDownTime(): number {
        return 5000;
    }
    isForced() {
        return true;
    }
}
