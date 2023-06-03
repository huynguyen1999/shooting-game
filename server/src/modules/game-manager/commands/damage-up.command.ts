import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class DamageUpCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  public increased_damage: number;
  public effect_duration: number;

  constructor(_id: string, receiver: Player, commandNumber: number) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.increased_damage = 1;
    this.effect_duration = 5000; // 5 seconds
  }
  execute(): void {
    this.receiver.damage += this.increased_damage;
    setTimeout(() => this.undo(), this.effect_duration);
  }
  public undo(): void {
    this.receiver.damage -= this.increased_damage;
  }
}
