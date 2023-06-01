import { IPlayer, IState, StateMachine } from "../../abstract";
import { Client } from "../../client";
import { Direction } from "../../client/commands";
import { Bullet } from "../bullet";
import { DeadState } from "./dead.state";
import { IdleState } from "./idle.state";
import { MovingState } from "./moving.state";
import { v4 as uuid } from "uuid";

export class Player extends IPlayer {
    public client_id: string;
    public state_machine!: StateMachine;
    public name: string;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public speed: number;
    public last_processed_command!: number;
    public position_buffer: any[] = [];
    public hp: number;
    public max_hp: number;
    constructor(
        clientId: string,
        name: string,
        x: number,
        y: number,
        radius: number,
        color: string,
        speed: number,
        hp: number,
    ) {
        super();
        this.client_id = clientId;
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.hp = hp;
        this.max_hp = hp;
        this.initiateStateMachine();
    }
    initiateStateMachine() {
        this.state_machine = new StateMachine(this);
        const idleState = new IdleState();
        const movingState = new MovingState();
        const deadState = new DeadState();
        this.state_machine
            .registerState(idleState.getStateKey(), idleState)
            .registerState(movingState.getStateKey(), movingState)
            .registerState(deadState.getStateKey(), deadState)
            .changeState(idleState.getStateKey());
    }

    moveUp(deltaTime: number) {
        this.y -= this.speed * deltaTime;
    }
    moveDown(deltaTime: number) {
        this.y += this.speed * deltaTime;
    }
    moveLeft(deltaTime: number) {
        this.x -= this.speed * deltaTime;
    }
    moveRight(deltaTime: number) {
        this.x += this.speed * deltaTime;
    }

    move(direction: Direction, deltaTime: number) {
        switch (direction) {
            case Direction.UP:
                this.moveUp(deltaTime);
                break;
            case Direction.DOWN:
                this.moveDown(deltaTime);
                break;
            case Direction.LEFT:
                this.moveLeft(deltaTime);
                break;
            case Direction.RIGHT:
                this.moveRight(deltaTime);
                break;
            default:
                break;
        }
    }
    shoot(angle: number) {
        const vx = Math.cos(angle),
            vy = Math.sin(angle);
        const bullet = new Bullet(
            uuid(),
            this.client_id,
            this.x,
            this.y,
            this.radius / 3,
            this.color,
            this.speed * 5,
            vx,
            vy,
        );
        Client.addBullet(bullet);
    }

    draw(context: CanvasRenderingContext2D): void {
        const offsetY = this.radius * 2;
        // draw circle
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        (context.fillStyle = this.color), context.fill();

        // draw hp bar
        const centerBarX = this.x;
        const centerBarY = this.y - offsetY;
        const barWidth = this.radius * 4;
        const barHeight = this.radius;
        const topLeftX = centerBarX - barWidth / 2;
        const topLeftY = centerBarY - barHeight / 2;
        context.beginPath();
        context.rect(topLeftX, topLeftY, barWidth, barHeight);
        context.stroke();
        const hpRatio = this.hp / this.max_hp;
        const barWidthRatio = hpRatio * barWidth;
        context.fillStyle = "red";
        context.fillRect(topLeftX, topLeftY, barWidthRatio, barHeight);
        // draw name
        context.textAlign = "center";
        context.font = `${Math.floor(this.radius / 2)}px Arial";`;
        context.fillStyle = "black";
        context.fillText(this.name, this.x, this.y + offsetY);
    }

    static serialize(backendPlayer: any) {
        const { _id, name, x, y, radius, color, speed, hp } = backendPlayer;
        return new Player(_id, name, x, y, radius, color, speed, hp);
    }
}
