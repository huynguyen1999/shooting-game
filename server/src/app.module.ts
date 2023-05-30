import { Module } from '@nestjs/common';
import { GatewayModule } from './modules';
import { GameManagerModule } from './modules/game-manager/game-manager.module';

@Module({
  imports: [GatewayModule, GameManagerModule],
})
export class AppModule {}
