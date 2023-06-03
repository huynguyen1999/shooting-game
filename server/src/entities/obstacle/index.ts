import { IObstacle } from '../../abstracts';
import { v4 as uuid } from 'uuid';

export class Obstacle extends IObstacle {
  public _id: string;
  public x: number;
  public y: number;
  public radius: number;
  public color: string;
  constructor(x: number, y: number, radius: number, color: string) {
    super();
    this._id = uuid();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  deserialize() {
    return {
      _id: this._id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
    };
  }
}
