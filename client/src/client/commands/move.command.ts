import { Command } from "../../abstract";
import { Player } from "../../entities/player";

export enum Direction {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right",
}
export class MoveCommand extends Command {
    public receiver: Player;
    public command_number: number;
    public direction: Direction;
    public delta_time: number;
    constructor(
        receiver: Player,
        commandNumber: number,
        direction: Direction,
        deltaTime: number,
    ) {
        super();
        this.receiver = receiver;
        this.command_number = commandNumber;
        this.direction = direction;
        this.delta_time = deltaTime;
    }
    execute() {
        this.receiver.move(this.direction, this.delta_time);
    }
    static deserialize(command: MoveCommand) {
        return {
            key: "move_command",
            command_number: command.command_number,
            direction: command.direction,
            delta_time: command.delta_time,
        };
    }
}
