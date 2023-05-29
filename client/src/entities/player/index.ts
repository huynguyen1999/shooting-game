import { IPlayer, IState, StateMachine } from "../../abstract";
import { Client } from "../../client"
import { Direction } from "../../client/commands";
import { Bullet } from "../bullet";
import { DeadState } from "./dead.state";
import { IdleState } from "./idle.state";
import { MovingState } from "./moving.state";

export class Player extends IPlayer {
    public state_machine!: StateMachine;
    public name: string;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public speed: number;
    public position_buffer: any[] = [];
    constructor(
        name: string,
        x: number,
        y: number,
        radius: number,
        color: string,
        speed: number,
    ) {
        super();
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
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
        const offsetY = this.radius + 5;
        // draw circle
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        (context.fillStyle = this.color), context.fill();
        // draw name
        context.textAlign = "center";
        context.font = `${Math.floor(this.radius / 2)}px Arial";`;
        context.fillStyle = "black";
        context.fillText(this.name, this.x, this.y - offsetY);
        // draw state
        context.fillText(
            this.state_machine.getCurrentState(),
            this.x,
            this.y + offsetY,
        );
    }
}
