import { Command } from '../../../abstracts';
import { Direction } from '../../../constants';
import { Player } from '../../../entities';
export class MoveCommand extends Command {
  public _id: string;
  public receiver: Player;
  public command_number: number;
  public direction: Direction;
  public delta_time: number;
  constructor(
    _id: string,
    receiver: Player,
    commandNumber: number,
    direction: Direction,
    deltaTime: number,
  ) {
    super();
    this._id = _id;
    this.receiver = receiver;
    this.command_number = commandNumber;
    this.direction = direction;
    this.delta_time = deltaTime;
  }
  execute() {
    this.receiver.move(this.direction, this.delta_time);
  }
}
