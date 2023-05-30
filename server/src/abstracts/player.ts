import { Direction } from '../modules/gateway/commands';
import { IState } from './state';

export abstract class IPlayer {
  abstract move(direction: Direction, deltaTime: number): void;

  abstract update(deltaTime: number): void;
}
