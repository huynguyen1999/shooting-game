import { Client } from "./client";
import { Entity } from "./entity";
import { renderWorld } from "./helper";
import { LagNetwork } from "./lag-network";

export class Server {
    public clients: Client[];
    public entities: Entity[];
    public last_processed_input: Record<number, number> = {};
    public network: LagNetwork;
    public canvas: any;
    public status: any;
    public update_rate: number;
    public update_interval: any;

    constructor(canvas: any, status: any) {
        this.clients = [];
        this.entities = [];
        this.last_processed_input = [];
        this.network = new LagNetwork();
        this.canvas = canvas;
        this.status = status;
        this.update_rate = 1;
        this.setUpdateRate(this.update_rate);
    }

    connect(client: Client): void {
        client.server = this;
        client.entity_id = this.clients.length;
        this.clients.push(client);
        const entity = new Entity();
        this.entities.push(entity);
        entity.entity_id = client.entity_id;
        const spawn_points = [4, 6];
        entity.x = spawn_points[client.entity_id];
    }

    setUpdateRate(hz: number): void {
        this.update_rate = hz;
        clearInterval(this.update_interval);
        this.update_interval = setInterval(() => {
            this.update();
        }, 1000 / this.update_rate);
    }

    update(): void {
        this.processInputs();
        this.sendWorldState();
        renderWorld(this.canvas, this.entities);
    }

    validateInput(input: any): boolean {
        if (Math.abs(input.press_time) > 1 / 40) {
            return false;
        }
        return true;
    }

    processInputs(): void {
        while (true) {
            const message = this.network.receive();
            if (!message) {
                break;
            }
            if (this.validateInput(message)) {
                const id = message.entity_id;
                this.entities[id].applyInput(message);
                this.last_processed_input[id] = message.input_sequence_number;
            }
        }
        let info = "Last acknowledged input: ";
        for (let i = 0; i < this.clients.length; ++i) {
            info +=
                "Player " +
                i +
                ": #" +
                (this.last_processed_input[i] || 0) +
                "   ";
        }
        this.status.textContent = info;
    }

    sendWorldState(): void {
        const world_state = [];
        const num_clients = this.clients.length;
        for (let i = 0; i < num_clients; i++) {
            const entity = this.entities[i];
            world_state.push({
                entity_id: entity.entity_id,
                position: entity.x,
                last_processed_input: this.last_processed_input[i],
            });
        }
        for (let i = 0; i < num_clients; i++) {
            const client = this.clients[i];
            client.network.send(client.lag, world_state);
        }
    }
}
