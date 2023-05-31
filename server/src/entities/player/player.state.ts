import { IState } from '../../abstracts';
import { Direction } from '../../constants';

export abstract class PlayerState extends IState {
  abstract move(direction: Direction, deltaTime: number): void;
  abstract shoot(angle: number, deltaTime: number): void;
}
