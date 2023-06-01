import { Command } from "../../abstract";
import { Player } from "../../entities/player";
import { v4 as uuid } from "uuid";
export enum Direction {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right",
}
export class MoveCommand extends Command {
    public _id: string;
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
        this._id = uuid();
        this.receiver = receiver;
        this.command_number = commandNumber;
        this.direction = direction;
        this.delta_time = deltaTime;
    }
    execute() {
        this.receiver.move(this.direction, this.delta_time);
    }
    deserialize() {
        return {
            key: "move_command",
            _id: this._id,
            command_number: this.command_number,
            direction: this.direction,
            delta_time: this.delta_time,
        };
    }
}
