import { IPlayer, IState, StateMachine } from '../../abstracts';
import { Direction, STATE_KEYS } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { getDistance } from '../../utils';
import { Bullet } from '../bullet';
import { DeadState } from './dead.state';
import { IdleState } from './idle.state';
import { MovingState } from './moving.state';
import { v4 as uuid } from 'uuid';
import { ShootingState } from './shooting.state';
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
  public last_processed_command: number;
  public hp: number;

  constructor(
    clientId: string,
    name: string,
    x: number,
    y: number,
    radius: number,
    color: string,
    speed: number,
    hp: number = 10,
  ) {
    super();
    this.client_id = clientId;
    this.name = name;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.last_processed_command = 0;
    this.initializeStateMachine();
    this.hp = hp;
  }

  initializeStateMachine() {
    this.state_machine = new StateMachine(this);
    const idleState = new IdleState();
    const movingState = new MovingState();
    const deadState = new DeadState();
    const shootingState = new ShootingState();
    this.state_machine
      .registerState(idleState.getStateKey(), idleState)
      .registerState(movingState.getStateKey(), movingState)
      .registerState(deadState.getStateKey(), deadState)
      .registerState(shootingState.getStateKey(), shootingState)
      .changeState(idleState.getStateKey());
  }
  move(direction: Direction, deltaTime: number) {
    this.changeState(STATE_KEYS.PLAYER.MOVING, { direction, deltaTime });
  }

  shoot(_id: string, angle: number) {
    this.changeState(STATE_KEYS.PLAYER.SHOOTING, { _id, angle });
  }
  update(deltaTime: number): void {
    this.state_machine.update(deltaTime);
  }
  onHit() {
    this.hp -= 1;
    if (this.hp <= 0) {
      this.changeState(STATE_KEYS.PLAYER.DEAD);
      setTimeout(() => GameManager.removePlayer(this), 1000);
      this.hp = 0;
    }
  }
  onCollide() {
    this.changeState(STATE_KEYS.PLAYER.IDLE);
  }
  deserialize() {
    return {
      client_id: this.client_id,
      name: this.name,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
      speed: this.speed,
      state: this.state_machine.getCurrentStateKey(),
      last_processed_command: this.last_processed_command,
      hp: this.hp,
    };
  }

  changeState(key: string, args: any = {}) {
    const currentState = this.state_machine.getCurrentStateKey();
    const isAlreadyDead = currentState === STATE_KEYS.PLAYER.DEAD;
    if (isAlreadyDead) {
      console.log('Player already dead');
      return;
    }
    this.state_machine.changeState(key, args);
    console.log('current state: ', this.state_machine.getCurrentStateKey());
  }
}
