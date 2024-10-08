import { IState } from "../../abstract";
import { Client } from "../../client";
import { Direction } from "../../client/commands";
import { STATE_KEYS } from "../../constants";
import { getDistance } from "../../utils";

export class MovingState extends IState {
    public getOwner(): any {
        return this.owner;
    }
    public setOwner(owner: any): MovingState {
        this.owner = owner;
        return this;
    }
    public onReEnter(args: any): void {}
    public onEnter(args: any): void {
        const { direction, deltaTime } = args;
        this.move(direction, deltaTime);
        this.owner.changeState(STATE_KEYS.PLAYER.IDLE);
    }

    public onUpdate(): void {}

    public onLeave(stateKey: string): void {}
    public getStateKey(): string {
        return STATE_KEYS.PLAYER.MOVING;
    }

    private moveUp(deltaTime: number) {
        return {
            x: this.owner.x,
            y: this.owner.y - this.owner.speed * deltaTime,
        };
    }
    private moveDown(deltaTime: number) {
        return {
            x: this.owner.x,
            y: this.owner.y + this.owner.speed * deltaTime,
        };
    }
    private moveLeft(deltaTime: number) {
        return {
            x: this.owner.x - this.owner.speed * deltaTime,
            y: this.owner.y,
        };
    }
    private moveRight(deltaTime: number) {
        return {
            x: this.owner.x + this.owner.speed * deltaTime,
            y: this.owner.y,
        };
    }

    private checkCollision(newPosition: { x: number; y: number }) {
        const players = Client.getPlayers();
        const obstacles = Client.getObstacles();
        for (const player of players.values()) {
            const isSelf = player.client_id === this.owner.client_id;
            const isDead =
                player.state_machine.getCurrentStateKey() ===
                STATE_KEYS.PLAYER.DEAD;
            if (isSelf || isDead) continue;
            const distance = getDistance(newPosition, player);
            const collisionDistance = this.owner.radius + player.radius;
            if (distance < collisionDistance) {
                return true;
            }
        }
        for (const obstacle of obstacles.values()) {
            const distance = getDistance(newPosition, obstacle);
            const collisionDistance = this.owner.radius + obstacle.radius;
            if (distance < collisionDistance) {
                return true;
            }
        }
        return false;
    }
    move(direction: Direction, deltaTime: number) {
        let newPosition = {
            x: this.owner.x,
            y: this.owner.y,
        };
        switch (direction) {
            case Direction.UP:
                newPosition = this.moveUp(deltaTime);
                break;
            case Direction.DOWN:
                newPosition = this.moveDown(deltaTime);
                break;
            case Direction.LEFT:
                newPosition = this.moveLeft(deltaTime);
                break;
            case Direction.RIGHT:
                newPosition = this.moveRight(deltaTime);
                break;
            default:
                break;
        }
        const isCollided = this.checkCollision(newPosition);
        if (!isCollided) {
            this.owner.x = newPosition.x;
            this.owner.y = newPosition.y;
            this.owner.direction = direction;
        } else {
            this.owner.changeState(STATE_KEYS.PLAYER.IDLE);
        }
    }
    public draw(context: CanvasRenderingContext2D) {}
    public getCoolDownTime(): number {
        return 0;
    }
}
