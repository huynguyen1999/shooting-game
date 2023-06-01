import { Player } from '../../entities';
import { GAME_ENVIRONMENT } from '../../constants';
import { Injectable } from '@nestjs/common';
import { Command } from '../../abstracts';
import { CommandFactory } from './services';
import * as gameUtils from '../../utils';
import { Bullet } from '../../entities/bullet';

export class GameManager {
  private players: Map<string, Player>;
  private bullets: Map<string, Bullet>;
  private commands: Command[] = [];
  private static instance: GameManager;
  private last_frame_time!: number;
  private constructor() {
    this.players = new Map<string, Player>();
    this.bullets = new Map<string, Bullet>();
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
    const commands = gameManager.commands;
    const command = CommandFactory.createCommand(player, data);
    commands.push(command);
  }

  private getGameState() {
    // send json data
    const players = {},
      bullets = {};

    this.players.forEach((player) => {
      players[player.client_id] = player.deserialize();
    });
    this.bullets.forEach((bullet: Bullet, key: string) => {
      bullets[key] = bullet.deserialize();
    });
    return { players, bullets };
  }

  static update() {
    const gameManager = GameManager.getInstance();
    const now = Date.now();
    const lastFrameTime = gameManager.last_frame_time || now;
    const deltaTime = (now - lastFrameTime) / 1000;
    gameManager.last_frame_time = now;
    // handle input
    while (gameManager.commands.length > 0) {
      const command = gameManager.commands.shift() as any;
      command.execute();
      command.receiver.last_processed_command = command.command_number;
    }
    // update players and bullets state
    gameManager.players.forEach((player) => player.update());
    gameManager.bullets.forEach((bullet) => bullet.update(deltaTime));

    // get game state
    return gameManager.getGameState();
  }
  static addBullet(bullet: Bullet) {
    const gameManager = GameManager.getInstance();
    const clientId = bullet.client_id;
    const player = gameManager.players.get(clientId);
    if (!player) return;
    gameManager.bullets.set(bullet._id, bullet);
  }
  static removeBullet(bullet: Bullet) {
    const gameManager = GameManager.getInstance();
    const bullets = gameManager.bullets;
    bullets.delete(bullet._id);
  }

  static getPlayers() {
    const gameManager = GameManager.getInstance();
    return gameManager.players;
  }
}
