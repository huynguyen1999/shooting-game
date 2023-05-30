import { Global, Module } from '@nestjs/common';
import { GameManager } from './game-manager';
import { InputHandlerService } from './services';

@Global()
@Module({
  providers: [
    {
      provide: 'GAME_MANAGER',
      useClass: GameManager,
    },
    InputHandlerService,
  ],
  exports: ['GAME_MANAGER'],
})
export class GameManagerModule {}
