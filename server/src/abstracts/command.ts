import { IPlayer } from './player';

export abstract class Command {
  abstract execute(...args: any): void;
}
