import { IPickUp } from "../../abstract";

export class PickUp extends IPickUp {
    public _id: string;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public key: string;
    constructor(
        _id: string,
        key: string,
        x: number,
        y: number,
        radius: number,
        color: string,
    ) {
        super();
        this._id = _id;
        this.key = key;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        // name
        context.fillStyle = "black";
        context.fillText(this.key.replace("_command", ""), this.x, this.y);
    }
    static serialize(data: any) {
        const { _id, key, x, y, radius, color } = data;
        return new PickUp(_id, key, x, y, radius, color);
    }
}
