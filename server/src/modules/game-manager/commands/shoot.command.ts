import { Command } from '../../../abstracts';
import { Player } from '../../../entities';
export class ShootCommand extends Command {
  public receiver: Player;
  public command_number: number;
  public dx: number;
  public dy: number;
  constructor(receiver: Player, commandNumber: number, dx: number, dy: number) {
    super();
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.dx = dx;
    this.dy = dy;
  }
  execute() {
    const shootAngle = Math.atan2(
      this.dy - this.receiver.y,
      this.dx - this.receiver.x,
    );
    this.receiver.shoot(shootAngle);
  }
}
