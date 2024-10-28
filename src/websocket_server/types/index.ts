export enum MessageType {
  USER_LOGIN = 'reg',
  CREATE_ROOM = 'create_room',
  UPDATE_ROOM = 'update_room',
  ADD_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  ADD_SHIPS = 'add_ships',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
};

export type User = {
  name: string;
  password: string;
  wsId: string;
  isLogined?: boolean;
};

export type Message = {
  type: string;
  data: string;
  id: number;
};

export type Room = {
  roomId: number,
  player1: string | null;
  player2: string | null;
};
