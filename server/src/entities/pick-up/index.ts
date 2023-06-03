import { IPickUp } from '../../abstracts';
import { v4 as uuid } from 'uuid';
import { Player } from '../player';
import { GameManager } from '../../modules/game-manager/game-manager';

export class PickUp extends IPickUp {
  public _id: string;
  public x: number;
  public y: number;
  public radius: number;
  public color: string;
  public key: string;
  constructor(
    key: string,
    x: number,
    y: number,
    radius: number,
    color: string,
  ) {
    super();
    this._id = uuid();
    this.key = key;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
  onPickedUp(player: Player) {
    GameManager.addCommand(player, {
      _id: uuid(),
      command_number: player.last_processed_command,
      key: this.key,
    });
    GameManager.removePickUp(this);
  }
  deserialize() {
    return {
      _id: this._id,
      key: this.key,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
    };
  }
}
