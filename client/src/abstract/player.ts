import { Direction } from "../client/commands";

export abstract class IPlayer {
    abstract move(direction: Direction, deltaTime: number): void;
    abstract shoot(angle: number): void;
    abstract draw(context: CanvasRenderingContext2D): void;
    abstract changeState(key: string): void;
}
