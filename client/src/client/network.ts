import { io, Socket } from "socket.io-client";
import { EVENTS } from "../constants";
import { EnvironmentLoadDto } from "../dtos/environment-load.dto";
export class Network {
    // contain authoritative data from the server
    public messages: any[];
    public env_data: any;
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
        this.env_data = data;
    }
    public static getEnvData(): EnvironmentLoadDto {
        return this.getInstance().env_data;
    }
}
