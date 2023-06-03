import { IState } from '../../abstracts';
import { STATE_KEYS } from '../../constants';

export class DeadState extends IState {
  public getOwner(): any {
    return this.owner;
  }
  public setOwner(owner: any): DeadState {
    this.owner = owner;
    return this;
  }
  public onReEnter(args: any): void {}

  public onEnter(args: any): void {}

  public onUpdate(): void {}

  public onLeave(stateKey: string): void {}
  public getStateKey(): string {
    return STATE_KEYS.PLAYER.DEAD;
  }

  public getCoolDownTime(): number {
    return 0;
  }

  public isForced(): boolean {
    return true;
  }
}
