import { Bullet } from "../entities/bullet";
import { Player } from "../entities/player";
import { getDifference, linearInterpolation } from "../utils";
import { InputHandler } from "./input-handler";
import { Network } from "./network";
import * as _ from "lodash";

export class Client {
    public client_id!: string;
    public players: Map<string, Player>;
    public bullets: Map<string, Bullet>;

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public update_rate!: number;
    public update_interval!: NodeJS.Timer;
    public input_handler!: InputHandler;
    public static instance: Client;
    public last_frame_time!: number;
    private constructor(updateRate = 50) {
        this.players = new Map<string, Player>();
        this.bullets = new Map<string, Bullet>();
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.input_handler = new InputHandler(this.canvas);
        this.createNewPlayer();
        this.setUpdateRate(updateRate);
    }

    public static getInstance() {
        if (!Client.instance) {
            Client.instance = new Client();
        }
        return Client.instance;
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

    public static addBullet(bullet: Bullet) {
        const client = Client.getInstance();
        client.bullets.set(bullet._id, bullet);
    }
    public update() {
        const now = Date.now();
        const lastFrameTime = this.last_frame_time || now;
        const deltaTime = (now - lastFrameTime) / 1000.0;
        this.last_frame_time = now;
        this.processServerMessages();
        const renderTimestamp = now - 1000.0 / 10;
        this.input_handler.update(deltaTime);
        //
        this.interpolatePlayers(renderTimestamp);
        this.interpolateBullets(renderTimestamp);
        this.renderWorld(deltaTime);
    }

    private removeDisconnectedPlayers(backendPlayers: Record<string, any>) {
        this.players.forEach((player: Player, clientId: string) => {
            const isDisconnected =
                !Object.keys(backendPlayers).includes(clientId);
            if (isDisconnected) this.players.delete(clientId);
        });
    }

    private removeDestroyedBullets(backendBullets: Record<string, any>) {
        const destroyedBullets = getDifference(
            [...this.bullets.keys()],
            Object.keys(backendBullets),
        );
        destroyedBullets.forEach((bulletId: string) => {
            this.bullets.delete(bulletId);
        });
    }

    private processAuthoritativeBullets(backendBullets: Record<string, any>) {
        for (const _id in backendBullets) {
            const backendBullet = backendBullets[_id];
            if (!this.bullets.has(_id)) {
                const newBullet = Bullet.serialize(backendBullet);
                this.bullets.set(_id, newBullet);
            }
            const clientBullet = this.bullets.get(_id);
            if (!clientBullet) {
                console.log("no client bullet");
                continue;
            }
            // synchronize
            clientBullet.x = backendBullet.x;
            clientBullet.y = backendBullet.y;

            const timestamp = Date.now();
            clientBullet.position_buffer.push({
                timestamp,
                x: backendBullet.x,
                y: backendBullet.y,
            });
        }
        this.removeDestroyedBullets(backendBullets);
    }
    private processAuthoritativePlayers(backendPlayers: Record<string, any>) {
        this.removeDisconnectedPlayers(backendPlayers);
        for (const clientId in backendPlayers) {
            const backendPlayer = backendPlayers[clientId];
            const {
                client_id,
                x,
                y,
                color,
                radius,
                name,
                speed,
                state,
                last_processed_command,
            } = backendPlayer;
            if (!this.players.has(clientId)) {
                const newPlayer = new Player(
                    client_id,
                    name,
                    x,
                    y,
                    radius,
                    color,
                    speed,
                );
                this.players.set(clientId, newPlayer);
                this.input_handler.setReceiver(newPlayer);
            }
            // sync client with server
            const clientPlayer = this.players.get(clientId) as Player;
            clientPlayer.x = backendPlayer.x;
            clientPlayer.y = backendPlayer.y;
            clientPlayer.last_processed_command = last_processed_command;
            clientPlayer.state_machine.changeState(state);
            // this client player
            if (clientId === this.client_id) {
                // server reconciliation
                this.reconciliatePlayerFromServer(clientPlayer);
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
    public reconciliatePlayerFromServer(clientPlayer: Player) {
        let i = 0;
        const unacknowledgedCommands =
            this.input_handler.unacknowledged_commands;
        while (i < unacknowledgedCommands.length) {
            const command = this.input_handler.unacknowledged_commands[i];
            // @ts-ignore
            if (command.command_number <= clientPlayer.last_processed_command) {
                unacknowledgedCommands.splice(i, 1);
            } else {
                command.execute();
                i++;
            }
        }
    }
    public processServerMessages() {
        const serverMessages = Network.receiveServerMessages();
        if (!serverMessages?.length) {
            return;
        }
        while (serverMessages.length) {
            const message = serverMessages.shift();
            const { players: backendPlayers, bullets: backendBullets } =
                message;
            this.processAuthoritativePlayers(backendPlayers);
            this.processAuthoritativeBullets(backendBullets);
        }
    }

    public interpolatePlayers(renderTimestamp: number) {
        this.players.forEach((player: Player, clientId: string) => {
            if (clientId === this.client_id) {
                return;
            }
            this.interpolateEntity(player, renderTimestamp);
        });
    }
    public interpolateBullets(renderTimestamp: number) {
        this.bullets.forEach((bullet: Bullet) => {
            this.interpolateEntity(bullet, renderTimestamp);
        });
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
        this.players.forEach((player: Player) => player.draw(this.context));
        this.bullets.forEach((bullet: Bullet) => bullet.draw(this.context));
    }
}
