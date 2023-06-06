import { IState } from '../../abstracts';
import { STATE_KEYS } from '../../constants';

export class ReadyState extends IState {
  public getOwner(): any {
    return this.owner;
  }
  public setOwner(owner: any): ReadyState {
    this.owner = owner;
    return this;
  }
  public onReEnter(args: any): void {}

  public onEnter(args: any): void {}

  public onUpdate(): void {}

  public onLeave(stateKey: string): void {}
  public getStateKey(): string {
    return STATE_KEYS.SKILL.READY;
  }
  public draw(context: CanvasRenderingContext2D) {}
  public getCoolDownTime(): number {
    return 500;
  }
  public isForced(): boolean {
    return true;
  }
}
