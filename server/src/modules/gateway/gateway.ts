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
import { PlayerInputDto, PlayerJoinDto } from './dtos';
import { GameManager } from '../game-manager/game-manager';

@WebSocketGateway({ cors: true })
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private update_rate: number;
  private update_interval: NodeJS.Timeout;

  constructor() {
    this.setUpdateRate();
  }
  handleConnection(client: any, ...args: any[]) {
    this.server.emit(EVENTS.ENVIRONMENT_LOAD, {
      ...GAME_ENVIRONMENT,
      client_id: client.id,
    });
  }
  handleDisconnect(client: any) {
    GameManager.handleDisconnect(client.id);
  }

  @SubscribeMessage(EVENTS.PLAYER_JOIN)
  async handlePlayerJoin(
    @ConnectedSocket() client: any,
    @MessageBody() data: PlayerJoinDto,
  ) {
    const { player_name: playerName } = data;
    GameManager.handlePlayerJoin(client.id, playerName);
  }

  setUpdateRate(updateRate: number = 20) {
    this.update_rate = updateRate;
    clearInterval(this.update_interval);
    const updateTick = 1000 / this.update_rate;
    this.update_interval = setInterval(() => this.update(), updateTick);
  }

  update() {
    const gameState = GameManager.update();
    this.server.emit(EVENTS.GAME_UPDATE, gameState);
  }

  @SubscribeMessage(EVENTS.PLAYER_INPUT)
  async handlePlayerInput(
    @MessageBody() data: PlayerInputDto,
    @ConnectedSocket() client: any,
  ) {
    GameManager.handlePlayerInput(client.id, data);
  }
}
