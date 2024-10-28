import { WebSocket } from "ws";

export enum MessageType {
  USER_LOGIN = 'reg',
  CREATE_ROOM = 'create_room',
  UPDATE_ROOM = 'update_room',
  ADD_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  START_GAME = 'start_game',
  ADD_SHIPS = 'add_ships',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
};

export enum AttackType {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
  ALIVE = 'alive',
}

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

export type ResponseType = {
  wsId: string,
  message: string,
};

export type Room = {
  roomId: number,
  player1: string | null;
  player2: string | null;
};

export type WebSocketWithId = {
  wsocket: WebSocket,
  id: string;
};

export type Game = {
  gameId: number;
  player1: string;
  player1Field: Ship[] | null;
  player1Board: BoardTile[][] | null;
  player2: string;
  player2Field: Ship[] | null;
  player2Board: BoardTile[][] | null;
  turn: string;
};

export type Ship = {
  position: [];
  direction: boolean;
  type: string;
  length: number;
};

export type BoardTile = {
  status: AttackType;
  shipId: number;
};
