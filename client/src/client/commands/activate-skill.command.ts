import { Command } from "../../abstract";
import { Player } from "../../entities/player";

export class ActivateSkillCommand extends Command {
    public receiver: Player;
    public command_number: number;
    constructor(receiver: Player, commandNumber: number) {
        super();
        this.receiver = receiver;
        this.command_number = commandNumber;
    }
    execute() {}
}
