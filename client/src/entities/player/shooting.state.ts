import { IState } from "../../abstract";
import { Client } from "../../client";
import { STATE_KEYS } from "../../constants";
import { Bullet } from "../bullet";
import { v4 as uuid } from "uuid";

export class ShootingState extends IState {
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): ShootingState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}
    public onEnter(args: any): void {
        const { angle } = args;
        this.shoot(angle);
        this.owner.changeState(STATE_KEYS.PLAYER.IDLE);
    }

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return STATE_KEYS.PLAYER.SHOOTING;
    }

    private shoot(angle: number) {
        if (!angle) return;
        const vx = Math.cos(angle),
            vy = Math.sin(angle);
        const bullet = new Bullet(
            uuid(),
            this.owner.client_id,
            this.owner.x,
            this.owner.y,
            this.owner.radius / 3,
            this.owner.color,
            this.owner.bullet_speed,
            this.owner.damage,
            vx,
            vy,
        );
        Client.addBullet(bullet);
    }
    public draw(context: CanvasRenderingContext2D) {}
    public getCoolDownTime(): number {
        return 0;
    }
}
