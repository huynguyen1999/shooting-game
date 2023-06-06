import { IState } from "../../abstract";
import { STATE_KEYS } from "../../constants";
import { Player } from "../player";
import * as MathJS from "mathjs";

export class ActivatingSkillState extends IState {
    private frame: number = 0;
    private sprite_index: number = 0;
    private activate_time!: number;
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): ActivatingSkillState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}

    public onEnter(args: {
        player: Player;
        angle: number;
        [key: string]: any;
    }): void {
        this.frame = 0;
        this.sprite_index = 0;
    }

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return STATE_KEYS.SKILL.ACTIVATING;
    }
    public draw(context: CanvasRenderingContext2D, player: Player) {
        this.frame += 1;
        if (this.frame % 5 === 0) {
            this.sprite_index += 1;
        }
        if (this.sprite_index >= this.owner.sprites.length) {
            this.sprite_index = 0;
        }
        context.globalAlpha = 0.8;
        context.save();
        const spriteSize = 200;
        context.translate(this.owner.x, this.owner.y);
        context.rotate(this.owner.angle);
        context.drawImage(
            this.owner.sprites[this.sprite_index],
            -spriteSize / 2,
            -spriteSize / 2,
            spriteSize,
            spriteSize,
        );

        context.restore();
        context.globalAlpha = 1;
    }
    public getCoolDownTime(): number {
        return 500;
    }
}
