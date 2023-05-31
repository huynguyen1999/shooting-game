import { BulletState } from './bullet.state';

export class DestroyedState extends BulletState {
  public getOwner(): any {
    return this.owner;
  }
  public setOwner(owner: any): BulletState {
    this.owner = owner;
    return this;
  }
  public onReEnter(args: any): void {}

  public onEnter(args: any): void {}

  public onUpdate(): void {}

  public onLeave(stateKey: string): void {}
  public getStateKey(): string {
    return 'destroyed_bullet';
  }
}
