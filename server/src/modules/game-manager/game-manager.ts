import { Player } from '../../entities';
import { GAME_ENVIRONMENT } from '../../constants';
import { Injectable } from '@nestjs/common';
import { Command } from '../../abstracts';
import { CommandFactory } from './services';
import * as gameUtils from '../../utils';
import { Bullet } from '../../entities/bullet';

export class GameManager {
  private players: Map<string, Player>;
  private bullets: Map<string, Bullet[]>;
  private commands: Command[] = [];
  private static instance: GameManager;
  private last_frame_time!: number;
  private constructor() {
    this.players = new Map<string, Player>();
    this.bullets = new Map<string, Bullet[]>();
  }

  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  static handleDisconnect(clientId: string) {
    const gameManager = GameManager.getInstance();
    if (gameManager.players.has(clientId)) {
      gameManager.players.delete(clientId);
    }
  }
  static handlePlayerJoin(clientId: string, playerName: string) {
    const gameManager = GameManager.getInstance();
    const joinedPlayer = new Player(
      clientId,
      playerName,
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
      10,
      gameUtils.generateRandomColor(),
      100,
    );
    gameManager.players.set(clientId, joinedPlayer);
  }

  static handlePlayerInput(clientId: string, data: any) {
    const gameManager = GameManager.getInstance();
    const player = gameManager.players.get(clientId);
    if (!player) return;
    const command = CommandFactory.createCommand(player, data);
    gameManager.commands.push(command);
  }

  private getGameState() {
    const players = {},
      bullets = {};

    this.players.forEach((player) => {
      players[player.client_id] = player.deserialize();
    });
    this.bullets.forEach((playerBullets: Bullet[], key: string) => {
      bullets[key] = playerBullets.map((bullet: Bullet) =>
        bullet.deserialize(),
      );
    });
    return { players, bullets };
  }

  static update() {
    const gameManager = GameManager.getInstance();
    const now = Date.now();
    const lastFrameTime = gameManager.last_frame_time || now;
    const deltaTime = (now - lastFrameTime) / 1000.0;
    gameManager.last_frame_time = now;
    // handle input
    while (gameManager.commands.length > 0) {
      const command = gameManager.commands.shift() as Command;
      command.execute();
    }
    // update players and bullets state
    gameManager.players.forEach((player) => player.update());
    gameManager.bullets.forEach((playerBullets) => {
      playerBullets.forEach((bullet) => bullet.update(deltaTime));
    });
    // get game state
    return gameManager.getGameState();
  }
  static addBullet(bullet: Bullet) {
    const gameManager = GameManager.getInstance();
    const clientId = bullet.client_id;
    const player = gameManager.players.get(clientId);
    if (!player) return;
    if (!gameManager.bullets.get(clientId)) {
      gameManager.bullets.set(clientId, []);
    }
    gameManager.bullets.get(clientId).push(bullet);
  }
  static removeBullet(bullet: Bullet) {
    const gameManager = GameManager.getInstance();
    const clientId = bullet.client_id;
    const playerBullets = gameManager.bullets.get(clientId);
    if (!playerBullets) return;
    const bulletIndex = playerBullets.indexOf(bullet);
    if (bulletIndex > -1) {
      playerBullets.splice(bulletIndex, 1);
    }
  }
}
