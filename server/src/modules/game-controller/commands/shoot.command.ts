import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class ShootCommand extends Command {
  public receiver: Player;
  public shoot_angle: number;
  public command_number: number;
  constructor(receiver: Player, commandNumber: number, shootAngle: number) {
    super();
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.shoot_angle = shootAngle;
  }
  execute() {
    // this.receiver.shoot(this.shoot_angle);
  }
  deserialize() {
    return {
      key: 'shoot_command',
      command_number: this.command_number,
      shoot_angle: this.shoot_angle,
    };
  }
}
