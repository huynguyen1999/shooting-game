import { IBullet, StateMachine } from "../../abstract";
import { DestroyedState } from "./destroyed.state";
import { MovingState } from "./moving.state";

export class Bullet extends IBullet {
    public state_machine!: StateMachine;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public speed: number;
    public position_buffer: any[] = [];
    public vx: number;
    public vy: number;
    constructor(
        x: number,
        y: number,
        radius: number,
        color: string,
        speed: number,
        vx: number,
        vy: number,
    ) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.vx = vx;
        this.vy = vy;
        this.initiateStateMachine();
    }
    initiateStateMachine() {
        this.state_machine = new StateMachine(this);
        const movingState = new MovingState();
        const destroyedState = new DestroyedState();
        this.state_machine
            .registerState(movingState.getStateKey(), movingState)
            .registerState(destroyedState.getStateKey(), destroyedState)
            .changeState(movingState.getStateKey());
    }
    update(deltaTime: number) {
        this.x += this.vx * deltaTime * this.speed;
        this.y += this.vy * deltaTime * this.speed;
    }
    draw(context: CanvasRenderingContext2D) {
        console.log("draw bullet");
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = "black";
        context.fill();
    }
}
