import { Injectable } from '@nestjs/common';
import { CommandFactory } from './command-factory.service';
import { Player } from '../../../entities';
import { Command } from '../../../abstracts';

@Injectable()
export class InputHandlerService {
  private commands: Command[] = [];
  constructor() {}

  handleInput(receiver: Player, data: any) {
    const command = CommandFactory.createCommand(receiver, data);
    this.commands.push(command);
  }
  processInputs() {
    while (this.commands.length > 0) {
      const command = this.commands.shift() as Command;
      command.execute();
    }
  }
}
