import { IPlayer, IState, StateMachine } from '../../abstracts';
import { DeadState } from './dead.state';
import { IdleState } from './idle.state';
import { MovingState } from './moving.state';
export class Player extends IPlayer {
  public name: string;
  public x: number;
  public y: number;
  public state!: IState;
  public radius: number;
  public color: string;
  public speed: number;
  public stateMachine!: StateMachine;

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
    this.initializeStateMachine();
  }

  initializeStateMachine() {
    this.stateMachine = new StateMachine(this);
    const idleState = new IdleState();
    const movingState = new MovingState();
    const deadState = new DeadState();
    this.stateMachine.registerState(idleState.getStateKey(), idleState);
    this.stateMachine.registerState(movingState.getStateKey(), movingState);
    this.stateMachine.registerState(deadState.getStateKey(), deadState);
    this.stateMachine.changeState(idleState.getStateKey());
  }
  move(): void {}

  deserialize() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
      speed: this.speed,
      state: this.stateMachine.getCurrentState(),
    };
  }
}
