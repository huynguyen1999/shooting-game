import { IState } from "../../abstract";
import { Direction } from "../../client/commands";

export abstract class PlayerState extends IState {
    abstract move(direction: Direction, deltaTime: number): void;
    abstract shoot(angle: number, deltaTime: number): void;
}
