import { IPlayer, IState, StateMachine } from '../../abstracts';
import { Direction, STATE_KEYS } from '../../constants';
import { GameManager } from '../../modules/game-manager/game-manager';
import { Bullet } from '../bullet';
import { Skill } from '../skill';
import { ActivatingSkillState } from './activating-skill.state';

import { DeadState } from './dead.state';
import { IdleState } from './idle.state';
import { MovingState } from './moving.state';
import { ShootingState } from './shooting.state';
export class Player extends IPlayer {
  public client_id: string;
  public name: string;
  public x: number;
  public y: number;
  public radius: number;
  public color: string;
  public speed: number;
  public state_machine!: StateMachine;
  public last_processed_command: number;
  public bullet_speed: number;
  public hp: number;
  public max_hp: number;
  public skill: Skill;
  public damage: number = 1;

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
    this.bullet_speed = this.speed * 2;
    this.last_processed_command = 0;
    this.max_hp = hp;
    this.hp = hp;
    this.skill = new Skill(this.x, this.y, 100);
    this.initializeStateMachine();
  }

  initializeStateMachine() {
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
    this.changeState(STATE_KEYS.PLAYER.MOVING, { direction, deltaTime });
  }

  shoot(_id: string, angle: number) {
    this.changeState(STATE_KEYS.PLAYER.SHOOTING, { _id, angle });
  }
  update(deltaTime: number): void {
    this.state_machine.update(deltaTime);
    this.skill.update(deltaTime);
  }
  activateSkill(angle: number) {
    this.skill.activate(this, angle);
  }
  onHit(bullet: Bullet) {
    this.hp -= bullet.damage;
    if (this.hp <= 0) {
      this.changeState(STATE_KEYS.PLAYER.DEAD);
      setTimeout(() => GameManager.removePlayer(this), 1000);
      this.hp = 0;
    }
  }
  onSkillHit(skill: Skill) {
    this.hp -= 5;
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
      skill: this.skill.deserialize(),
    };
  }

  changeState(key: string, args: any = {}) {
    const currentState = this.state_machine.getCurrentStateKey();
    const isAlreadyDead = currentState === STATE_KEYS.PLAYER.DEAD;
    if (isAlreadyDead) {
      // console.log('Player already dead');
      return;
    }
    this.state_machine.changeState(key, args);
  }
}
