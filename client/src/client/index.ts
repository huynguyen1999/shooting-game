import { Bullet } from "../entities/bullet";
import { Player } from "../entities/player";
import { linearInterpolation } from "../utils";
import { InputHandler } from "./input-handler";
import { Network } from "./network";
import * as _ from "lodash";

export class Client {
    public client_id!: string;
    public players: Record<string, Player> = {};
    public monsters: Record<string, any> = {};
    public bullets: Record<string, any[]> = {};

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public update_rate!: number;
    public update_interval!: NodeJS.Timer;
    public input_handler!: InputHandler;
    public static instance: Client;
    public last_frame_time!: number;
    private constructor(updateRate = 50) {
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.input_handler = new InputHandler();
        this.createNewPlayer();
        this.setUpdateRate(updateRate);
    }

    public static getInstance() {
        if (!Client.instance) {
            Client.instance = new Client();
        }
        return Client.instance;
    }

    public static addBullet(bullet: Bullet) {
        const client = Client.getInstance();
        const bullets = client.bullets[client.client_id];
        bullets.push(bullet);
        console.log(bullets);
    }
    public createNewPlayer() {
        let playerName = "";
        while (!playerName) {
            playerName = prompt("Enter your name") as string;
            Network.sendNewPlayer(playerName);
        }
    }
    public setUpdateRate(updateRate: number) {
        this.update_rate = updateRate;
        clearInterval(this.update_interval);
        const frameDeltaTime = 1000 / updateRate;
        this.update_interval = setInterval(() => this.update(), frameDeltaTime);
    }

    public update() {
        const now = Date.now();
        const lastFrameTime = this.last_frame_time || now;
        const deltaTime = (now - lastFrameTime) / 1000.0;
        this.last_frame_time = now;
        this.processServerMessages();
        if (!Object.keys(this.players)?.length) {
            return;
        }
        const renderTimestamp = now - 1000.0 / 50;
        this.input_handler.update(deltaTime);
        //
        this.interpolatePlayers(renderTimestamp);
        // this.interpolateBullets(renderTimestamp);
        //
        this.renderWorld(deltaTime);
    }

    private removeDisconnectedPlayers(backendPlayers: Record<string, any>) {
        Object.keys(this.players).forEach((clientId) => {
            const isDisconnected =
                !Object.keys(backendPlayers).includes(clientId);
            if (this.players[clientId] && isDisconnected) {
                delete this.players[clientId];
            }
        });
    }
    private processAuthoritativePlayers(
        backendPlayers: Record<string, any>,
        lastProcessedInput: Record<string, number>,
    ) {
        this.removeDisconnectedPlayers(backendPlayers);
        for (const clientId in backendPlayers) {
            const backendPlayer = backendPlayers[clientId];
            const { x, y, color, radius, name, speed, state } = backendPlayer;
            if (!this.players?.[clientId]) {
                this.players[clientId] = new Player(
                    name,
                    x,
                    y,
                    radius,
                    color,
                    speed,
                );
                this.input_handler.setReceiver(this.players[clientId]);
                this.bullets[clientId] = [];
            }
            // sync client with server
            const clientPlayer = this.players[clientId];
            clientPlayer.x = backendPlayer.x;
            clientPlayer.y = backendPlayer.y;
            clientPlayer.state_machine.changeState(backendPlayer.state);
            // this client player
            if (clientId === this.client_id) {
                // server reconciliation
            } else {
                // other client's player
                const timestamp = Date.now();
                clientPlayer.position_buffer.push({
                    timestamp,
                    x: backendPlayer.x,
                    y: backendPlayer.y,
                });
            }
        }
    }
    // public reconciliatePlayerFromServer(
    //     clientPlayer: Player,
    //     backendLastProcessedInput: number,
    // ) {
    //     let j = 0;
    //     while (j < this.pending_inputs.length) {
    //         const input = this.pending_inputs[j];
    //         if (input.input_sequence_number <= backendLastProcessedInput) {
    //             this.pending_inputs.splice(j, 1);
    //         } else {
    //             clientPlayer.handleInput(input);
    //             j++;
    //         }
    //     }
    // }
    public processServerMessages() {
        const serverMessages = Network.receiveServerMessages();
        if (!serverMessages?.length) {
            return;
        }
        while (serverMessages.length) {
            const message = serverMessages.shift();
            const { players: backendPlayers, last_processed_input } = message;
            this.processAuthoritativePlayers(
                backendPlayers,
                last_processed_input,
            );
        }
    }
    // public processInputs() {
    //     const now_ts = Date.now();
    //     const last_ts = this.last_frame_ts || now_ts;
    //     const dt_sec = (now_ts - last_ts) / 1000.0;
    //     this.last_frame_ts = now_ts;

    //     if (!Object.values(this.movement_key_map).includes(true)) {
    //         return;
    //     }
    //     const input = {
    //         dt_sec,
    //         movement_key_map: this.movement_key_map,
    //         input_sequence_number: this.input_sequence_number++,
    //     };
    //     Network.sendPlayerInput(input);
    //     this.predictClientSide(input);
    //     this.pending_inputs.push(input);
    // }

    // public predictClientSide(input: any) {
    //     if (!this.players?.[this.client_id]) return;
    //     this.players[this.client_id].handleInput(input);
    // }

    public interpolatePlayers(renderTimestamp: number) {
        for (const clientId in this.players) {
            const player = this.players[clientId];

            // No point in interpolating this client's entity.
            if (clientId === this.client_id) {
                continue;
            }
            this.interpolateEntity(player, renderTimestamp);
        }
    }
    public interpolateBullets(renderTimestamp: number) {
        for (const clientId in this.bullets) {
            const bullets = this.bullets[clientId];

            // No point in interpolating this client's entity.
            if (clientId === this.client_id) {
                continue;
            }
            for (const bullet of bullets) {
                this.interpolateEntity(bullet, renderTimestamp);
            }
        }
    }
    public interpolateEntity(entity: any, renderTimestamp: number) {
        // Find the two authoritative positions surrounding the rendering timestamp.
        const buffer = entity.position_buffer;

        // Drop older positions.
        while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
            buffer.shift();
        }

        // Interpolate between the two surrounding authoritative positions.
        if (
            buffer.length >= 2 &&
            buffer[0].timestamp <= renderTimestamp &&
            renderTimestamp <= buffer[1].timestamp
        ) {
            const x0 = buffer[0].x;
            const x1 = buffer[1].x;
            const y0 = buffer[0].y;
            const y1 = buffer[1].y;
            const t0 = buffer[0].timestamp;
            const t1 = buffer[1].timestamp;
            const ratio = (renderTimestamp - t0) / (t1 - t0);
            entity.x = linearInterpolation(x0, x1, ratio);
            entity.y = linearInterpolation(y0, y1, ratio);
        }
    }
    public renderWorld(deltaTime: number) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const clientId in this.players) {
            this.players[clientId].draw(this.context);
        }
        for (const clientId in this.bullets) {
            this.bullets[clientId].forEach((bullet) => {
                bullet.update(deltaTime);
                bullet.draw(this.context);
            });
        }
    }
}
