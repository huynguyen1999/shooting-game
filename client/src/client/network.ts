import { io, Socket } from "socket.io-client";
import { EVENTS } from "../constants";
import { EnvironmentLoadDto } from "../dtos/environment-load.dto";
import { Client } from ".";
export class Network {
    // contain authoritative data from the server
    public messages: any[];
    public socket!: Socket;
    public static instance: Network;
    private constructor() {
        this.messages = [];
        this.socket = io(`${window.location.host.split(":")[0]}:3000`);
        this.socket.on(
            EVENTS.ENVIRONMENT_LOAD,
            this.onReceiveEnvironmentLoad.bind(this),
        );
        this.socket.on(
            EVENTS.GAME_UPDATE,
            this.onReceiveServerUpdate.bind(this),
        );
    }
    public static getInstance() {
        if (!Network.instance) {
            Network.instance = new Network();
        }
        return Network.instance;
    }
    public static receiveServerMessages() {
        return this.getInstance().messages;
    }
    public static sendPlayerInput(data: any) {
        this.getInstance().socket.emit(EVENTS.PLAYER_INPUT, data);
    }

    public static sendNewPlayer(playerName: string) {
        this.getInstance().socket.emit(EVENTS.PLAYER_JOIN, {
            player_name: playerName,
        });
    }
    private onReceiveServerUpdate(data: any) {
        this.messages.push(data);
    }
    private onReceiveEnvironmentLoad(data: EnvironmentLoadDto) {
        const { canvas_height, canvas_width, canvas_styles, client_id } = data;
        Client.getInstance().client_id = this.socket.id;
        Client.getInstance().canvas.width = canvas_width;
        Client.getInstance().canvas.height = canvas_height;
        for (const style in canvas_styles) {
            // @ts-ignore
            Client.getInstance().canvas.style[style] = canvas_styles[style];
        }
    }
}
