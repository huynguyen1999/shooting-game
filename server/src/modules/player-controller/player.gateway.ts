import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

import { EVENTS } from '../../constants';
@WebSocketGateway({ cors: true })
export class PlayerGateway {
  @WebSocketServer()
  private server: Server;
  constructor() {}
}
