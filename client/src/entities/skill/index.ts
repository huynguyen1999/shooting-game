import { StateMachine } from "../../abstract";
import { ISkill } from "../../abstract/skill";
import { STATE_KEYS } from "../../constants";
import { ActivatingSkillState } from "./activating.state";
import { OnCoolDownState } from "./on-cool-down.state";
import { ReadyState } from "./ready.state";

export class Skill extends ISkill {
    public _id: string;
    public x: number;
    public y: number;
    public radius: number;
    public angle: number = 0;
    public state_machine!: StateMachine;
    public sprites: any[] = [];
    constructor(_id: string, x: number, y: number, radius: number) {
        super();
        this._id = _id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        for (let i = 0; i < 3; i++) {
            const sprite = new Image();
            sprite.src = `./rasengan/${i + 1}.png`;
            this.sprites.push(sprite);
        }
        this.initializeStateMachine();
    }
    initializeStateMachine() {
        this.state_machine = new StateMachine(this);
        this.state_machine
            .registerState(STATE_KEYS.SKILL.READY, new ReadyState())
            .registerState(
                STATE_KEYS.SKILL.ACTIVATING,
                new ActivatingSkillState(),
            )
            .registerState(STATE_KEYS.SKILL.ON_COOL_DOWN, new OnCoolDownState())
            // .setDefaultState(STATE_KEYS.SKILL.READY)
            .changeState(STATE_KEYS.SKILL.READY);
    }
    activate(): void {}
    update(deltaTime: number): void {
        this.state_machine.update(deltaTime);
    }
    draw(context: CanvasRenderingContext2D): void {
        context.fillText(
            `Skill state: ${this.state_machine.getCurrentStateKey()}`,
            100,
            100,
        );
        this.state_machine.getCurrentState()?.draw(context);
    }
}
