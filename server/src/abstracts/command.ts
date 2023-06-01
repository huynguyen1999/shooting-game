import { IPlayer } from './player';

export abstract class Command {
  abstract execute(): void;
}
