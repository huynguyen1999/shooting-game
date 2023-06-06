export const EVENTS = {
  CHAT: 'chat',
  GAME_UPDATE: 'game_update',
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  PLAYER_INPUT: 'player_input',
  ENVIRONMENT_LOAD: 'environment_load',
};

export const GAME_ENVIRONMENT = {
  canvas_height: 500,
  canvas_width: 700,
  canvas_styles: {
    border: '10px solid black',
    borderRadius: '20px',
  },
};

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export const STATE_KEYS = {
  PLAYER: {
    DEAD: 'dead_player',
    IDLE: 'idle_player',
    MOVING: 'moving_player',
    SHOOTING: 'shooting_player',
    ACTIVATING_SKILL: 'activating_skill_player',
  },
  BULLET: {
    MOVING: 'moving_bullet',
    DESTROYED: 'destroyed_bullet',
  },
  SKILL: {
    ON_COOL_DOWN: 'on_cool_down_skill',
    READY: 'ready_skill',
    ACTIVATING: 'activating_skill',
  },
};

export const COMMAND_KEYS = {
  USER_INPUT: {
    MOVE: 'move_command',
    SHOOT: 'shoot_command',
    ACTIVATE_SKILL: 'activate_skill_command',
  },
  BUFF: {
    BULLET_SPEED_UP: 'bullet_speed_up_command',
    DAMAGE_UP: 'damage_up_command',
    SPEED_UP: 'speed_up_command',
    HEAL: 'heal_command',
  },
};
