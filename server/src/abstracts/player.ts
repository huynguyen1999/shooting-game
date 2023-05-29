import { Direction } from '../modules/game-controller/commands';
import { IState } from './state';

export abstract class IPlayer {
  abstract move(direction: Direction, deltaTime: number): void;

  abstract update(deltaTime: number): void;
}
