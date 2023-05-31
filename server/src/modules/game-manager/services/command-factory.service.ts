import { Player } from '../../../entities';
import { ShootCommand, MoveCommand, ActivateSkillCommand } from '../commands';

export class CommandFactory {
  static createCommand(receiver: Player, command: any) {
    const { key, command_number } = command;
    switch (key) {
      case 'move_command':
        const { direction, delta_time } = command;
        return new MoveCommand(receiver, command_number, direction, delta_time);
      case 'shoot_command':
        const { sx, sy, dx, dy } = command;
        return new ShootCommand(receiver, command_number, dx, dy);
      case 'activate_skill_command':
        return new ActivateSkillCommand(receiver, command_number);
    }
    return null;
  }
}
