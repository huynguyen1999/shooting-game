import { Command } from "../../abstract";
import { Player } from "../../entities/player";

export class ShootCommand extends Command {
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
        this.receiver = receiver;
        this.command_number = commandNumber;
        this.dx = dx;
        this.dy = dy;
    }
    execute() {
        // this.receiver.shoot(this.shoot_angle);
    }
    deserialize() {
        return {
            key: "shoot_command",
            command_number: this.command_number,
            dx: this.dx,
            dy: this.dy,
        };
    }
}
