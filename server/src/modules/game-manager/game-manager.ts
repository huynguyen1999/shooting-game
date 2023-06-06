import { Player } from '../../entities';
import { COMMAND_KEYS, GAME_ENVIRONMENT, STATE_KEYS } from '../../constants';
import { Command } from '../../abstracts';
import { CommandFactory } from './services';
import * as gameUtils from '../../utils';
import { Bullet } from '../../entities/bullet';
import { Obstacle } from '../../entities/obstacle';
import { PickUp } from '../../entities/pick-up';
import * as _ from 'lodash';

export class GameManager {
  private players: Map<string, Player>;
  private bullets: Map<string, Bullet>;
  private obstacles: Map<string, Obstacle>;
  private pick_ups: Map<string, PickUp>;
  private commands: Command[] = [];
  private static instance: GameManager;
  private last_frame_time!: number;
  private constructor() {
    this.players = new Map<string, Player>();
    this.bullets = new Map<string, Bullet>();
    this.obstacles = new Map<string, Obstacle>();
    this.pick_ups = new Map<string, PickUp>();
    this.generateObstacles();
    setInterval(() => this.generatePickUp(), 2000);
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

  checkPlayerSpawnedAtEmptySpace(player: Player) {
    for (const obstacle of this.obstacles.values()) {
      const distance = gameUtils.getDistance(player, obstacle);
      const collisionDistance = player.radius + obstacle.radius;
      if (distance <= collisionDistance) {
        return false;
      }
    }
    return true;
  }
  static handlePlayerJoin(clientId: string, playerName: string) {
    const gameManager = GameManager.getInstance();
    let joinedPlayer: Player;
    do {
      joinedPlayer = new Player(
        clientId,
        playerName,
        Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
        Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
        10,
        gameUtils.generateRandomColor(),
        100,
      );
      // check if player is spawned at empty space
    } while (!gameManager.checkPlayerSpawnedAtEmptySpace(joinedPlayer));

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

  static addCommand(player: Player, data: any) {
    const gameManager = GameManager.getInstance();
    const commands = gameManager.commands;
    const buffCommand = CommandFactory.createCommand(player, data);
    commands.push(buffCommand);
  }

  private getGameState() {
    // send json data
    const players = {},
      bullets = {},
      pickUps = {};

    this.players.forEach((player) => {
      players[player.client_id] = player.deserialize();
    });
    this.bullets.forEach((bullet: Bullet, key: string) => {
      bullets[key] = bullet.deserialize();
    });
    this.pick_ups.forEach(
      (pickUp: PickUp, key: string) => (pickUps[key] = pickUp.deserialize()),
    );
    return { players, bullets, pick_ups: pickUps };
  }

  static update() {
    try {
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
      gameManager.players.forEach((player) => player.update(deltaTime));
      gameManager.bullets.forEach((bullet) => bullet.update(deltaTime));

      // get game state
      return gameManager.getGameState();
    } catch (e) {
      // console.log('wtf: ', e);
    }
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
  static removePlayer(player: Player) {
    const gameManager = GameManager.getInstance();
    const players = gameManager.players;
    players.delete(player.client_id);
  }
  static getPlayers(isDeserialized: boolean = false) {
    const gameManager = GameManager.getInstance();
    if (!isDeserialized) return gameManager.players;
    const deserializedPlayers = {};
    gameManager.players.forEach((player: Player, key: string) => {
      deserializedPlayers[key] = player.deserialize();
    });
    return deserializedPlayers;
  }
  static getObstacles(isDeserialized: boolean = false) {
    const gameManager = GameManager.getInstance();
    if (!isDeserialized) return gameManager.obstacles;
    const deserializedObstacles = {};
    gameManager.obstacles.forEach((obstacle: Obstacle, key: string) => {
      deserializedObstacles[key] = obstacle.deserialize();
    });
    return deserializedObstacles;
  }
  static getPickUps(isDeserialized: boolean = false) {
    const gameManager = GameManager.getInstance();
    if (!isDeserialized) return gameManager.pick_ups;
    const deserializedPickUps = {};
    gameManager.pick_ups.forEach((pickUp: Obstacle, key: string) => {
      deserializedPickUps[key] = pickUp.deserialize();
    });
    return deserializedPickUps;
  }
  generateObstacles() {
    const nObstacles = 5;
    for (let i = 0; i < nObstacles; i++) {
      const obstacle = new Obstacle(
        Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
        Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
        40,
        'gray',
      );
      this.obstacles.set(obstacle._id, obstacle);
    }
  }

  generatePickUp() {
    const pickUpKey = _.sample(Object.values(COMMAND_KEYS.BUFF));
    const pickUp = new PickUp(
      pickUpKey,
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_width),
      Math.floor(Math.random() * GAME_ENVIRONMENT.canvas_height),
      20,
      'blue',
    );
    this.pick_ups.set(pickUp._id, pickUp);
    // only available for 5 seconds
    setTimeout(() => {
      GameManager.removePickUp(pickUp);
    }, 5000);
  }
  static removePickUp(pickUp: PickUp) {
    const pickUps = GameManager.getInstance().pick_ups;
    pickUps.delete(pickUp._id);
  }
}
