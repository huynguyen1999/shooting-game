import { Command } from "../../abstract";
import { Player } from "../../entities/player";
import { v4 as uuid } from "uuid";

export class ShootCommand extends Command {
    public _id: string;
    public receiver: Player;
    public command_number: number;
    public dx: number;
    public dy: number;
    constructor(
        receiver: Player,
        commandNumber: number,
        dx: number,
        dy: number,
    ) {
        super();
        this._id = uuid();
        this.receiver = receiver;
        this.command_number = commandNumber;
        this.dx = dx;
        this.dy = dy;
    }
    execute() {
        const shootAngle = Math.atan2(
            this.dy - this.receiver.y,
            this.dx - this.receiver.x,
        );
        this.receiver.shoot(shootAngle);
    }
    deserialize() {
        return {
            key: "shoot_command",
            _id: this._id,
            command_number: this.command_number,
            dx: this.dx,
            dy: this.dy,
        };
    }
}
