import { Direction } from '../constants';

export abstract class IPlayer {
  abstract move(direction: Direction, deltaTime: number): void;

  abstract shoot(angle: number): void;

  abstract update(deltaTime: number): void;
}
