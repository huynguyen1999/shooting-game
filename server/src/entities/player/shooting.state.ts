import { IState } from '../../abstracts';
import { STATE_KEYS } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { Bullet } from '../bullet';

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
    const { _id, angle } = args;
    this.shoot(_id, angle);
    this.owner.changeState(STATE_KEYS.PLAYER.IDLE);
  }

  public onUpdate(): void {}

  public onLeave(stateKey: string): void {}
  public getStateKey(): string {
    return STATE_KEYS.PLAYER.SHOOTING;
  }
  private shoot(_id: string, angle: number) {
    const vx = Math.cos(angle),
      vy = Math.sin(angle);
    const bullet = new Bullet(
      _id,
      this.owner.client_id,
      this.owner.x,
      this.owner.y,
      this.owner.radius / 3,
      this.owner.color,
      this.owner.bullet_speed,
      vx,
      vy,
    );
    GameManager.addBullet(bullet);
  }
  public getCoolDownTime(): number {
    return 0;
  }
}
