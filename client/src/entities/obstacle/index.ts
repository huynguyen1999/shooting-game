import { IObstacle } from "../../abstract";

export class Obstacle extends IObstacle {
    public _id: string;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    constructor(
        _id: string,
        x: number,
        y: number,
        radius: number,
        color: string,
    ) {
        super();
        this._id = _id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        (context.fillStyle = this.color), context.fill();
    }
    static serialize(data: any) {
        const { _id, x, y, radius, color } = data;
        return new Obstacle(_id, x, y, radius, color);
    }
}
