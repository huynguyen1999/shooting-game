import { COMMAND_KEYS } from '../../../constants';
import { Player } from '../../../entities';
import {
  ShootCommand,
  MoveCommand,
  ActivateSkillCommand,
  BulletSpeedUpCommand,
  SpeedUpCommand,
  DamageUpCommand,
  HealCommand,
} from '../commands';

export class CommandFactory {
  static createCommand(receiver: Player, command: any) {
    const { _id, key, command_number } = command;
    switch (key) {
      case COMMAND_KEYS.USER_INPUT.MOVE:
        const { direction, delta_time } = command;
        return new MoveCommand(
          _id,
          receiver,
          command_number,
          direction,
          delta_time,
        );
      case COMMAND_KEYS.USER_INPUT.SHOOT:
        const { dx, dy } = command;
        return new ShootCommand(_id, receiver, command_number, dx, dy);
      case COMMAND_KEYS.USER_INPUT.ACTIVATE_SKILL:
        return new ActivateSkillCommand(_id, receiver, command_number);
      case COMMAND_KEYS.BUFF.BULLET_SPEED_UP:
        return new BulletSpeedUpCommand(_id, receiver, command_number);
      case COMMAND_KEYS.BUFF.SPEED_UP:
        return new SpeedUpCommand(_id, receiver, command_number);
      case COMMAND_KEYS.BUFF.DAMAGE_UP:
        return new DamageUpCommand(_id, receiver, command_number);
      case COMMAND_KEYS.BUFF.HEAL:
        return new HealCommand(_id, receiver, command_number);
    }
    return null;
  }
}
