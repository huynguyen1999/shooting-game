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
    const obstacles = GameManager.getObstacles(true);
    this.server.emit(EVENTS.ENVIRONMENT_LOAD, {
      ...GAME_ENVIRONMENT,
      client_id: client.id,
      obstacles,
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
    try {
      const { player_name: playerName } = data;
      GameManager.handlePlayerJoin(client.id, playerName);
    } catch (exception) {
      // console.log('player input exception: ', exception);
    }
  }

  setUpdateRate(updateRate: number = 60) {
    this.update_rate = updateRate;
    clearInterval(this.update_interval);
    const updateTick = 1000 / this.update_rate;
    this.update_interval = setInterval(() => this.update(), updateTick);
  }

  update() {
    try {
      const gameState = GameManager.update();
      this.server.emit(EVENTS.GAME_UPDATE, gameState);
    } catch (exception) {
      // console.log('update gateway error: ', exception);
    }
  }

  @SubscribeMessage(EVENTS.PLAYER_INPUT)
  async handlePlayerInput(
    @MessageBody() data: PlayerInputDto,
    @ConnectedSocket() client: any,
  ) {
    GameManager.handlePlayerInput(client.id, data);
  }
}
