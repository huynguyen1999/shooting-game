import { Direction } from '../constants';

export abstract class IPlayer {
  abstract move(direction: Direction, deltaTime: number): void;

  // _id is command id => bullet id
  abstract shoot(_id: string, angle: number): void;

  abstract update(deltaTime: number): void;
}
