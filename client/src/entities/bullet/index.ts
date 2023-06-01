import { IBullet, StateMachine } from "../../abstract";
import { Client } from "../../client";
import { getDistance } from "../../utils";
import { Player } from "../player";
import { DestroyedState } from "./destroyed.state";
import { MovingState } from "./moving.state";
export class Bullet extends IBullet {
    public client_id: string;
    public _id: string;
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
        _id: string,
        clientId: string,
        x: number,
        y: number,
        radius: number,
        color: string,
        speed: number,
        vx: number,
        vy: number,
    ) {
        super();
        this._id = _id;
        this.client_id = clientId;
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

    private handleCollision() {
        const players = Client.getPlayers();
        players.forEach((player: Player) => {
            if (player.client_id === this.client_id) return;
            const distance = getDistance(this, player);
            const collisionDistance = this.radius + player.radius;
            if (distance <= collisionDistance) {
                Client.removeBullet(this);
            }
        });
    }
    update(deltaTime: number) {
        this.x += this.vx * deltaTime * this.speed;
        this.y += this.vy * deltaTime * this.speed;
        this.handleCollision();
    }
    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = "black";
        context.fill();
    }

    static serialize(bulletData: any) {
        const { _id, client_id, x, y, radius, color, speed, vx, vy, state } =
            bulletData;
        return new Bullet(_id, client_id, x, y, radius, color, speed, vx, vy);
    }
}
