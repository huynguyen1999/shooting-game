import { ISkill, StateMachine } from '../../abstracts';
import { STATE_KEYS } from '../../constants';
import { Player } from '../player';
import { ReadyState } from './ready.state';
import { ActivatingSkillState } from './activating.state';
import { OnCoolDownState } from './on-cool-down.state';
import { v4 as uuid } from 'uuid';
// rasengan
export class Skill extends ISkill {
  public _id: string;
  public x: number;
  public y: number;
  public radius: number;
  public angle: number = 0;
  public state_machine: StateMachine;

  constructor(x: number, y: number, radius: number) {
    super();
    this._id = uuid();
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.initializeStateMachine();
  }
  initializeStateMachine() {
    this.state_machine = new StateMachine(this);
    this.state_machine
      .registerState(STATE_KEYS.SKILL.READY, new ReadyState())
      .registerState(STATE_KEYS.SKILL.ACTIVATING, new ActivatingSkillState())
      .registerState(STATE_KEYS.SKILL.ON_COOL_DOWN, new OnCoolDownState())
      .changeState(STATE_KEYS.SKILL.READY);
  }
  update(deltaTime: number) {
    this.state_machine.update(deltaTime);
  }
  activate(player: Player, angle: number) {
    this.angle = angle;
    this.state_machine.changeState(STATE_KEYS.SKILL.ACTIVATING, {
      player,
    });
  }

  deserialize() {
    return {
      _id: this._id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      angle: this.angle,
      state: this.state_machine.getCurrentStateKey(),
    };
  }
}
