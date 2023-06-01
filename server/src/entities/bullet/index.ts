import { IBullet, StateMachine } from '../../abstracts';
import { GAME_ENVIRONMENT } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { getDistance } from '../../utils';
import { DestroyedState } from './destroyed.state';
import { MovingState } from './moving.state';
import { v4 as uuid } from 'uuid';

export class Bullet extends IBullet {
  public _id: string;
  public client_id: string;
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

  private isOutOfWorld() {
    return (
      this.x < 0 ||
      this.x > GAME_ENVIRONMENT.canvas_width ||
      this.y < 0 ||
      this.y > GAME_ENVIRONMENT.canvas_height
    );
  }

  private handleCollision() {
    const players = GameManager.getPlayers();
    players.forEach((player) => {
      if (player.client_id === this.client_id) return;
      const distance = getDistance(this, player);
      const collisionDistance = this.radius + player.radius;
      if (distance <= collisionDistance) {
        GameManager.removeBullet(this);
        // notify player on hit
        player.onHit();
      }
    });
  }
  update(deltaTime: number) {
    this.x += this.vx * deltaTime * this.speed;
    this.y += this.vy * deltaTime * this.speed;

    // out of bound
    if (this.isOutOfWorld()) {
      GameManager.removeBullet(this);
    }
    // handle collision
    this.handleCollision();
  }

  deserialize() {
    return {
      _id: this._id,
      client_id: this.client_id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
      speed: this.speed,
      vx: this.vx,
      vy: this.vy,
      state: this.state_machine.getCurrentState(),
    };
  }
}
