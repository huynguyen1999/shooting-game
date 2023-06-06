export abstract class ISkill {
    constructor() {}
    abstract update(deltaTime: number): void;
    abstract activate(): void;
    abstract draw(context: CanvasRenderingContext2D): void;
}
