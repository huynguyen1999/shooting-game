export const EVENTS = {
    CHAT: "chat",
    GAME_UPDATE: "game_update",
    PLAYER_INPUT: "player_input",
    PLAYER_JOIN: "player_join",
    PLAYER_LEAVE: "player_leave",
    ENVIRONMENT_LOAD: "environment_load",
};

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
  