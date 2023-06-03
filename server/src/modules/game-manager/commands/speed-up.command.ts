import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class SpeedUpCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  public speed_up_ratio = 1.5;
  public effect_duration: number;
  public speed_diff = 0;

  constructor(_id: string, receiver: Player, commandNumber: number) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.speed_up_ratio = 1.5;
    this.effect_duration = 5000; // 5 seconds
  }
  execute(): void {
    const newSpeed = this.receiver.speed * this.speed_up_ratio;
    this.speed_diff = newSpeed - this.receiver.speed;
    this.receiver.speed = newSpeed;
    setTimeout(() => this.undo(), this.effect_duration);
  }
  public undo(): void {
    this.receiver.speed -= this.speed_diff;
  }
}
