import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { InputHandlerService } from './services';

@Module({
  providers: [GameGateway, InputHandlerService],
})
export class GameControllerModule {}
