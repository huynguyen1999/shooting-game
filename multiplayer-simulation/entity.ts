export class Entity {
    public entity_id: number | null;
    public x: number;
    public speed: number; // units/s
    public position_buffer: { x: number; timestamp: number }[];

    constructor() {
        this.x = 0;
        this.speed = 2;
        this.position_buffer = [];
        this.entity_id = null;
    }

    // Apply user's input to this entity.
    public applyInput(input: { press_time: number }): void {
        this.x += input.press_time * this.speed;
    }
}
