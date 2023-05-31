import { IPlayer, IState, StateMachine } from '../../abstracts';
import { Direction } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { Bullet } from '../bullet';
import { DeadState } from './dead.state';
import { IdleState } from './idle.state';
import { MovingState } from './moving.state';
import { v4 as uuid } from 'uuid';
export class Player extends IPlayer {
  public client_id: string;
  public name: string;
  public x: number;
  public y: number;
  public state!: IState;
  public radius: number;
  public color: string;
  public speed: number;
  public state_machine!: StateMachine;

  constructor(
    clientId: string,
    name: string,
    x: number,
    y: number,
    radius: number,
    color: string,
    speed: number,
  ) {
    super();
    this.client_id = clientId;
    this.name = name;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.initializeStateMachine();
  }

  initializeStateMachine() {
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
      this.client_id,
      this.x,
      this.y,
      this.radius / 3,
      this.color,
      this.speed * 5,
      vx,
      vy,
    );
    GameManager.addBullet(bullet);
  }
  update(): void {}

  deserialize() {
    return {
      client_id: this.client_id,
      name: this.name,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
      speed: this.speed,
      state: this.state_machine.getCurrentState(),
    };
  }
}
