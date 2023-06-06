import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class ActivateSkillCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  public dx: number;
  public dy: number;
  constructor(
    _id: string,
    receiver: Player,
    commandNumber: number,
    dx: number,
    dy: number,
  ) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.dx = dx;
    this.dy = dy;
  }
  execute(): void {
    const shootAngle = Math.atan2(
      this.dy - this.receiver.y,
      this.dx - this.receiver.x,
    );
    this.receiver.activateSkill(shootAngle);
  }
}
