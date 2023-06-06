import { IPlayer } from './player';

export abstract class ISkill {
  abstract activate(player: IPlayer, angle: number);
}
