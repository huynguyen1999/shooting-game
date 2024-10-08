import { IBullet, StateMachine } from "../../abstract";
import { Client } from "../../client";
import { STATE_KEYS } from "../../constants";
import { getDistance } from "../../utils";
import { Obstacle } from "../obstacle";
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
    public damage: number;
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
        damage: number,
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
        this.damage = damage;
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
        const obstacles = Client.getObstacles() as Map<string, Obstacle>;
        for (const obstacle of obstacles.values()) {
            const distance = getDistance(this, obstacle);
            const collisionDistance = this.radius + obstacle.radius;
            if (distance < collisionDistance) {
                Client.removeBullet(this);
                return;
            }
        }
        const players = Client.getPlayers() as Map<string, Player>;
        players.forEach((player: Player) => {
            const isSelf = player.client_id === this.client_id;
            const isDead =
                player.state_machine.getCurrentStateKey() ===
                STATE_KEYS.PLAYER.DEAD;
            if (isSelf || isDead) return;
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
        return this;
    }
    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }

    static serialize(bulletData: any) {
        const {
            _id,
            client_id,
            x,
            y,
            radius,
            color,
            speed,
            damage,
            vx,
            vy,
            state,
        } = bulletData;
        return new Bullet(
            _id,
            client_id,
            x,
            y,
            radius,
            color,
            speed,
            damage,
            vx,
            vy,
        );
    }
}
