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
