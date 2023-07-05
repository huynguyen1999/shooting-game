import { IPlayer, IState, StateMachine } from "../../abstract";
import { Client } from "../../client";
import { Direction } from "../../client/commands";
import { STATE_KEYS } from "../../constants";
import { Bullet } from "../bullet";
import { DeadState } from "./dead.state";
import { IdleState } from "./idle.state";
import { MovingState } from "./moving.state";
import { v4 as uuid } from "uuid";
import { ShootingState } from "./shooting.state";
import { ActivatingSkillState } from "./activating-skill.state";
import { Skill } from "../skill";

export class Player extends IPlayer {
    public client_id: string;
    public state_machine!: StateMachine;
    public name: string;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public speed: number;
    public bullet_speed: number;
    public last_processed_command!: number;
    public position_buffer: any[] = [];
    public hp: number;
    public max_hp: number;
    public skill!: Skill;
    constructor(
        clientId: string,
        name: string,
        x: number,
        y: number,
        radius: number,
        color: string,
        speed: number,
        hp: number,
        skill: Skill,
    ) {
        super();
        this.client_id = clientId;
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.bullet_speed = this.speed * 2;
        this.hp = hp;
        this.max_hp = hp;
        this.skill = skill;
        this.initiateStateMachine();
    }
    initiateStateMachine() {
        this.state_machine = new StateMachine(this);
        this.state_machine
            .registerState(STATE_KEYS.PLAYER.IDLE, new IdleState())
            .registerState(STATE_KEYS.PLAYER.MOVING, new MovingState())
            .registerState(STATE_KEYS.PLAYER.SHOOTING, new ShootingState())
            .registerState(
                STATE_KEYS.PLAYER.ACTIVATING_SKILL,
                new ActivatingSkillState(),
            )
            .registerState(STATE_KEYS.PLAYER.DEAD, new DeadState())
            .setDefaultState(STATE_KEYS.PLAYER.IDLE)
            .changeState(STATE_KEYS.PLAYER.IDLE);
    }

    move(direction: Direction, deltaTime: number) {
        this.changeState(STATE_KEYS.PLAYER.MOVING, {
            direction,
            deltaTime,
        });
    }
    shoot(angle: number) {
        this.changeState(STATE_KEYS.PLAYER.SHOOTING, {
            angle,
        });
    }
    onCollide() {}

    draw(context: CanvasRenderingContext2D): void {
        if (this.client_id === Client.getInstance().client_id){
            this.skill.draw(context);
        }
        //
        context.globalAlpha = 1;
        const state = this.state_machine.getCurrentState() as IState;
        state?.draw(context);
        const offsetY = this.radius * 2;
        // draw circle
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        // draw name
        context.textAlign = "center";
        context.font = `${Math.floor(this.radius / 2)}px Arial";`;
        context.fillStyle = "black";
        context.fillText(`${this.name}`, this.x, this.y + offsetY);
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
        //
    }

    static serialize(backendPlayer: any) {
        const { _id, name, x, y, radius, color, speed, hp, skill } =
            backendPlayer;
        const backendSkill = new Skill(
            skill._id,
            skill.x,
            skill.y,
            skill.radius,
        );
        return new Player(
            _id,
            name,
            x,
            y,
            radius,
            color,
            speed,
            hp,
            backendSkill,
        );
    }
    update(deltaTime: number) {
        this.state_machine.update(deltaTime);
        this.skill.state_machine.update(deltaTime);
        return this;
    }
    changeState(key: string, args: any = {}) {
        const currentState = this.state_machine.getCurrentStateKey();
        const isAlreadyDead = currentState === STATE_KEYS.PLAYER.DEAD;
        if (isAlreadyDead) {
            // console.log("Player already dead");
            return;
        }
        this.state_machine.changeState(key, args);
    }
}
