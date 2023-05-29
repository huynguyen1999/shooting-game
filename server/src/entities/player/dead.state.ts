import { IState } from '../../abstracts';

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
    return 'dead_player';
  }
}
