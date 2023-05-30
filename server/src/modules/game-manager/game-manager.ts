import { Player } from '../../entities';
import { GAME_ENVIRONMENT } from '../../constants';
import * as gameUtils from '../../utils';
import { InputHandlerService } from './services';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameManager {
  private players: Record<string, Player> = {};
  constructor(private inputHandler: InputHandlerService) {}

  handleDisconnect(clientId: string) {
    if (this.players?.[clientId]) {
      delete this.players[clientId];
    }
  }
  handlePlayerJoin(clientId: string, playerName: string) {
    const joinedPlayer = new Player(
      playerName,
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
      10,
      gameUtils.generateRandomColor(),
      100,
    );
    this.players[clientId] = joinedPlayer;
  }

  handlePlayerInput(clientId: string, data: any) {
    const player = this.players[clientId];
    if (!player) return;
    this.inputHandler.handleInput(player, data);
  }

  private getGameState() {
    const players = {},
      bullets = {};
    // players
    for (const clientId in this.players) {
      players[clientId] = this.players[clientId].deserialize();
    }
    // bullets
    return { players, bullets };
  }

  update() {
    // hand input
    this.inputHandler?.processInputs();
    // update players and bullets state
    return this.getGameState();
  }
}
