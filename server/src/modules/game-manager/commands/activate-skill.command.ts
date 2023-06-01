import { Command } from '../../../abstracts';
import { Player } from '../../../entities';

export class ActivateSkillCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  constructor(_id: string, receiver: Player, commandNumber: number) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
  }
  execute(): void {}
}
