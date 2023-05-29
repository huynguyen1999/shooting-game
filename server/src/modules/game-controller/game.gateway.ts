import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { EVENTS, GAME_ENVIRONMENT } from '../../constants';
import { Player } from '../../entities';
import * as gameUtils from '../../utils';
import { PlayerJoinDto } from './dtos/player-join.dto';
import { PlayerInputDto } from './dtos';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private update_rate: number;
  private update_interval: NodeJS.Timeout;
  private players: Record<string, Player> = {};
  private last_processed_input: Record<string, number> = {};

  constructor() {
    this.setUpdateRate(1);
  }
  handleConnection(client: any, ...args: any[]) {
    this.server.emit(EVENTS.ENVIRONMENT_LOAD, {
      ...GAME_ENVIRONMENT,
    });
  }
  handleDisconnect(client: any) {
    if (this.players?.[client.id]) {
      delete this.players[client.id];
      delete this.last_processed_input[client.id];
    }
  }

  @SubscribeMessage(EVENTS.PLAYER_JOIN)
  async handlePlayerJoin(
    @ConnectedSocket() client: any,
    @MessageBody() data: PlayerJoinDto,
  ) {
    const { player_name: playerName } = data;
    const joinedPlayer = new Player(
      playerName,
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
      10,
      gameUtils.generateRandomColor(),
      100,
    );
    this.players[client.id] = joinedPlayer;
  }

  setUpdateRate(updateRate: number) {
    this.update_rate = updateRate;
    clearInterval(this.update_interval);
    const updateTick = 1000 / this.update_rate;
    this.update_interval = setInterval(() => this.update(), updateTick);
  }

  update() {
    this.processInputs();
    this.sendGameState();
  }
  private sendGameState() {
    const deserializedPlayers = {};
    for (const clientId in this.players) {
      deserializedPlayers[clientId] = this.players[clientId].deserialize();
    }
    this.server.emit(EVENTS.GAME_UPDATE, {
      players: deserializedPlayers,
      last_processed_input: this.last_processed_input,
    });
  }
  private processInputs() {}

  @SubscribeMessage(EVENTS.PLAYER_INPUT)
  async handlePlayerInput(
    @MessageBody() data: PlayerInputDto,
    @ConnectedSocket() client: any,
  ) {
    console.log(data);
    const clientId = client.id;
    const { movement_key_map, dt_sec, input_sequence_number } = data;
    if (!movement_key_map) {
      return;
    }
    if (input_sequence_number) {
      this.last_processed_input[clientId] = input_sequence_number;
    }
    const { up, down, left, right } = movement_key_map;
    const player = this.players[clientId];
    if (up) {
      player.y -= player.speed * dt_sec;
    }
    if (down) {
      player.y += player.speed * dt_sec;
    }
    if (left) {
      player.x -= player.speed * dt_sec;
    }
    if (right) {
      player.x += player.speed * dt_sec;
    }
  }
}
