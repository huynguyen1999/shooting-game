import { Command } from "../abstract";
import { Player } from "../entities/player";
import { Direction, MoveCommand, ShootCommand } from "./commands";
import { Network } from "./network";

export class InputHandler {
    private movement_key_map: Record<string, boolean>;
    private current_command_number: number;
    private receiver!: Player;
    private commands: Command[];
    constructor() {
        this.movement_key_map = {
            up: false,
            down: false,
            left: false,
            right: false,
        };
        this.current_command_number = 0;
        this.commands = [];
        // this.receiver = receiver;
        addEventListener("keydown", this.onKeyDown.bind(this));
        addEventListener("keyup", this.onKeyUp.bind(this));
        addEventListener("click", this.onClick.bind(this));
    }

    setReceiver(receiver: Player) {
        this.receiver = receiver;
        return this;
    }
    private onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "w":
                this.movement_key_map.up = true;
                break;
            case "d":
                this.movement_key_map.right = true;
                break;
            case "s":
                this.movement_key_map.down = true;
                break;
            case "a":
                this.movement_key_map.left = true;
                break;
            default:
                break;
        }
    }
    private onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case "w":
                this.movement_key_map.up = false;
                break;
            case "d":
                this.movement_key_map.right = false;
                break;
            case "s":
                this.movement_key_map.down = false;
                break;
            case "a":
                this.movement_key_map.left = false;
                break;
            default:
                break;
        }
    }
    private onClick(event: MouseEvent) {
        if (!this.receiver) {
            return;
        }
        const shootAngle = Math.atan2(
            event.offsetY - this.receiver.y,
            event.offsetX - this.receiver.x,
        );
        const shootCommand = new ShootCommand(
            this.receiver,
            this.current_command_number++,
            shootAngle,
        );
        shootCommand.execute();
        this.commands.push(shootCommand);
        Network.sendPlayerInput(ShootCommand.deserialize(shootCommand));
    }

    move(direction: Direction, deltaTime: number) {
        if (!this.receiver) {
            return;
        }
        const moveCommand = new MoveCommand(
            this.receiver,
            this.current_command_number++,
            direction,
            deltaTime,
        );
        moveCommand.execute();
        this.commands.push(moveCommand);
        Network.sendPlayerInput(MoveCommand.deserialize(moveCommand));
    }

    update(deltaTime: number) {
        if (!this.receiver) {
            return;
        }
        const { up, down, left, right } = this.movement_key_map;
        if (up) {
            this.move(Direction.UP, deltaTime);
        }
        if (down) {
            this.move(Direction.DOWN, deltaTime);
        }
        if (left) {
            this.move(Direction.LEFT, deltaTime);
        }
        if (right) {
            this.move(Direction.RIGHT, deltaTime);
        }
    }
}
