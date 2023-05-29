import { Module } from '@nestjs/common';
import { GameControllerModule, PlayerControllerModule } from './modules';

@Module({
  imports: [PlayerControllerModule, GameControllerModule]
})
export class AppModule {}
