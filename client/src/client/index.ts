import { STATE_KEYS } from "../constants";
import { EnvironmentLoadDto } from "../dtos/environment-load.dto";
import { Bullet } from "../entities/bullet";
import { Obstacle } from "../entities/obstacle";
import { PickUp } from "../entities/pick-up";
import { Player } from "../entities/player";
import { Skill } from "../entities/skill";
import { getDifference, linearInterpolation } from "../utils";
import { InputHandler } from "./input-handler";
import { Network } from "./network";
import * as _ from "lodash";

export class Client {
    public client_id!: string;
    public players: Map<string, Player>;
    public bullets: Map<string, Bullet>;
    public obstacles: Map<string, Obstacle>;
    public pick_ups: Map<string, PickUp>;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public update_rate!: number;
    public update_interval!: NodeJS.Timer;
    public input_handler!: InputHandler;
    public static instance: Client;
    public last_frame_time!: number;
    public is_env_loaded: boolean = false;
    private constructor() {
        this.players = new Map<string, Player>();
        this.bullets = new Map<string, Bullet>();
        this.obstacles = new Map<string, Obstacle>();
        this.pick_ups = new Map<string, PickUp>();
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.input_handler = new InputHandler(this.canvas);
        this.createNewPlayer();
        this.setUpdateRate();
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
    public setUpdateRate(updateRate: number = 60) {
        this.update_rate = updateRate;
        clearInterval(this.update_interval);
        const frameDeltaTime = 1000 / updateRate;
        this.update_interval = setInterval(() => this.update(), frameDeltaTime);
    }

    public static addBullet(bullet: Bullet) {
        const client = Client.getInstance();
        client.bullets.set(bullet._id, bullet);
    }
    public static getPlayers() {
        return Client.getInstance().players;
    }
    public static removeBullet(bullet: Bullet) {
        const bullets = Client.getInstance().bullets;
        bullets.delete(bullet._id);
    }
    public update() {
        const now = Date.now();
        const lastFrameTime = this.last_frame_time || now;
        const deltaTime = (now - lastFrameTime) / 1000;
        this.last_frame_time = now;
        this.processServerMessages();
        const renderTimestamp = now - 1000 / 50;
        this.input_handler.update(deltaTime);
        // renderTimestamp is a point in the past, which is before the last frame timestamp, usually equal to Date.now() - frameTime
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
    private removeDestroyedPickUps(backendPickUps: Record<string, any>) {
        const destroyedPickUps = getDifference(
            [...this.pick_ups.keys()],
            Object.keys(backendPickUps),
        );
        destroyedPickUps.forEach((pickUpId: string) => {
            this.pick_ups.delete(pickUpId);
        });
    }
    public processAuthoritativePickUps(backendPickUps: Record<string, any>) {
        this.removeDestroyedPickUps(backendPickUps);
        for (const _id in backendPickUps) {
            const backendPickUp = backendPickUps[_id];
            if (!this.pick_ups.has(_id)) {
                const newPickUp = PickUp.serialize(backendPickUp);
                this.pick_ups.set(_id, newPickUp);
            }
            const clientPickUp = this.pick_ups.get(_id) as PickUp;
            // synchronize
            clientPickUp.x = backendPickUp.x;
            clientPickUp.y = backendPickUp.y;
        }
    }
    private syncWithBackendBullets(
        _id: string,
        backendBullet: Record<string, any>,
    ) {
        if (!this.bullets.has(_id)) {
            const newBullet = Bullet.serialize(backendBullet);
            this.bullets.set(_id, newBullet);
        }
        const clientBullet = this.bullets.get(_id) as Bullet;
        // synchronize
        clientBullet.x = backendBullet.x;
        clientBullet.y = backendBullet.y;
        return clientBullet;
    }
    private processAuthoritativeBullets(backendBullets: Record<string, any>) {
        this.removeDestroyedBullets(backendBullets);
        for (const _id in backendBullets) {
            const backendBullet = backendBullets[_id];
            const clientBullet = this.syncWithBackendBullets(
                _id,
                backendBullet,
            );

            if (clientBullet.client_id === this.client_id) {
                continue;
            }
            const timestamp = Date.now();
            clientBullet.position_buffer.push({
                timestamp,
                x: backendBullet.x,
                y: backendBullet.y,
            });
        }
    }

    private syncWithBackendPlayer(
        clientId: string,
        backendPlayer: Record<string, any>,
    ) {
        const {
            client_id,
            x,
            y,
            color,
            radius,
            name,
            speed,
            state,
            hp,
            last_processed_command,
            skill,
        } = backendPlayer;
        const backendSkill = new Skill(
            skill._id,
            skill.x,
            skill.y,
            skill.radius,
        );
        if (!this.players.has(clientId)) {
            const newPlayer = new Player(
                client_id,
                name,
                x,
                y,
                radius,
                color,
                speed,
                hp,
                backendSkill,
            );
            this.players.set(clientId, newPlayer);
            // set receiver as the current client
            if (clientId === this.client_id) {
                this.input_handler.setReceiver(newPlayer);
            }
        }
        const clientPlayer = this.players.get(clientId) as Player;
        clientPlayer.x = x;
        clientPlayer.y = y;
        clientPlayer.hp = hp;
        clientPlayer.last_processed_command = last_processed_command;
        clientPlayer.skill._id = skill._id;
        clientPlayer.state_machine.changeState(state);
        clientPlayer.skill.x = skill.x;
        clientPlayer.skill.y = skill.y;
        clientPlayer.skill.radius = skill.radius;
        clientPlayer.skill.angle = skill.angle || 0;
        clientPlayer.skill.state_machine.changeState(skill.state);
        return clientPlayer;
    }
    private processAuthoritativePlayers(backendPlayers: Record<string, any>) {
        this.removeDisconnectedPlayers(backendPlayers);
        for (const clientId in backendPlayers) {
            const backendPlayer = backendPlayers[clientId];

            const clientPlayer = this.syncWithBackendPlayer(
                clientId,
                backendPlayer,
            );
            if (clientId === this.client_id) {
                this.reconciliatePlayerFromServer(clientPlayer);
            } else {
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
        // environment load
        let envData;
        if (!this.is_env_loaded && (envData = Network.getEnvData())) {
            const {
                canvas_height,
                canvas_width,
                canvas_styles,
                client_id,
                obstacles,
            } = envData;
            this.client_id = client_id;
            this.canvas.width = canvas_width;
            this.canvas.height = canvas_height;
            for (const style in canvas_styles) {
                // @ts-ignore
                this.canvas.style[style] = canvas_styles[style];
            }
            for (const obstacleId in obstacles) {
                const obstacle = Obstacle.serialize(obstacles[obstacleId]);
                this.obstacles.set(obstacleId, obstacle);
            }
            this.is_env_loaded = true;
        }
        // game state update
        const serverMessages = Network.receiveServerMessages();
        if (!serverMessages?.length) {
            return;
        }
        while (serverMessages.length) {
            const message = serverMessages.shift();
            const {
                players: backendPlayers,
                bullets: backendBullets,
                pick_ups: backendPickUps,
            } = message;
            this.processAuthoritativePickUps(backendPickUps);
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
        this.obstacles.forEach((obstacle: Obstacle) =>
            obstacle.draw(this.context),
        );
        this.pick_ups.forEach((pickUp: PickUp) => pickUp.draw(this.context));
        this.players.forEach((player: Player) =>
            player.update(deltaTime).draw(this.context),
        );
        this.bullets.forEach((bullet: Bullet) =>
            bullet.update(deltaTime).draw(this.context),
        );
    }
    static getObstacles() {
        const client = Client.getInstance();
        return client.obstacles;
    }
}
