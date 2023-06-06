import { IState } from '../../abstracts';
import { STATE_KEYS } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { getDistance } from '../../utils';
import { Player } from '../player';
import * as MathJS from 'mathjs';

export class ActivatingSkillState extends IState {
  private activate_time!: number;
  public getOwner(): any {
    return this.owner;
  }
  public setOwner(owner: any): ActivatingSkillState {
    this.owner = owner;
    return this;
  }
  public onReEnter(args: any): void {}

  public onEnter(args: { player: Player; [key: string]: any }): void {
    const { player } = args;
    if (!player) return;
    const angle = this.owner.angle;
    const skillOrigin = MathJS.transpose([
      player.radius + this.owner.radius,
      0,
    ]);

    const rotationMatrix = [
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)],
    ];

    const rotatedCoords = MathJS.transpose(
      MathJS.multiply(rotationMatrix, skillOrigin),
    );
    const skillNewOrigin = MathJS.add([player.x, player.y], rotatedCoords);
    this.owner.x = skillNewOrigin[0];
    this.owner.y = skillNewOrigin[1];
    this.activate_time = Date.now();
    player.changeState(STATE_KEYS.PLAYER.ACTIVATING_SKILL);
    // notify user skill is used
    const players = GameManager.getPlayers() as Map<string, Player>;
    players.forEach((p: Player) => {
      if (p.client_id === player.client_id) return;
      const distance = getDistance(this.owner, p);
      const collisionDistance = this.owner.radius + p.radius;
      if (distance < collisionDistance) {
        p.onSkillHit(this.owner);
      }
    });
  }

  public onUpdate(): void {
    if (!this.activate_time) return;
    const now = Date.now();
    const elapsedTime = now - this.activate_time;
    if (elapsedTime >= this.getCoolDownTime()) {
      this.owner.state_machine.changeState(STATE_KEYS.SKILL.ON_COOL_DOWN);
    }
  }

  public onLeave(stateKey: string): void {}
  public getStateKey(): string {
    return STATE_KEYS.SKILL.ACTIVATING;
  }
  public draw(context: CanvasRenderingContext2D) {}
  public getCoolDownTime(): number {
    return 500;
  }
}
