import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class HealCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  public hp: number;

  constructor(_id: string, receiver: Player, commandNumber: number) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.hp = 1;
  }
  execute(): void {
    if (this.receiver.hp < this.receiver.max_hp) {
      this.receiver.hp += this.hp;
    }
  }
  public undo(): void {}
}
