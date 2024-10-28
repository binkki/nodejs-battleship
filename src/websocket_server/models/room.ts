import { randomUUID } from "crypto";
import { Message, MessageType, Room } from "../types";
import { getUserById } from "./user";
import { createGame } from "./game";

const rooms: Room[] = [];
let maxRoomId = 0;

export const createRoom = (id: string) : string => {
  rooms
  const newRoom = {
    roomId: maxRoomId,
    player1: id,
    player2: null,
  };
  maxRoomId += 1;
  rooms.push(newRoom);
  const user = getUserById(id);
  const response = {
    type: "update_room",
    data: JSON.stringify([
      {
        roomId: newRoom.roomId,
        roomUsers:
          [
            {
              name: user.name,
              index: 0,
            }
          ],
        },
    ]),
    id: 0,
  }
  return JSON.stringify(response);
}

export const addUserToRoom = (websocketId : string, data: { indexRoom: number }) : string | null => {
  const selectedRoom = rooms.filter((x: Room) => x.roomId === data.indexRoom)[0];
  if (websocketId === selectedRoom.player1) return null;
  selectedRoom.player2 = websocketId;
  const oldPlayerRoomIndex = rooms.findIndex((x: Room) => x.player1 === websocketId);
  delete rooms[oldPlayerRoomIndex];
  const currentGame = createGame(selectedRoom.player1 ?? "", selectedRoom.player2);
  const responsePlayer1 = JSON.stringify({
    wsId: selectedRoom.player1,
    message: {
      type: MessageType.CREATE_GAME,
      data: JSON.stringify({
        idGame: currentGame.gameId,
        idPlayer: selectedRoom.player1,
      }),
      id: 0,
    },    
  });
  const responsePlayer2 = JSON.stringify({
    wsId: selectedRoom.player2,
    message: {
      type: MessageType.CREATE_GAME,
      data: JSON.stringify({
        idGame: currentGame.gameId,
        idPlayer: selectedRoom.player2,
      }),
      id: 0,
    },    
  });
  return JSON.stringify([responsePlayer1, responsePlayer2]);
}

export const updateRoom = () : string => {
  const availableRooms = rooms.filter((x: Room) => x.player2 === null)
    .map((x: Room) => {
      const roomPlayer = getUserById(x.player1 ?? "");
      return {
        roomId: x.roomId,
        roomUsers: [{
          name: roomPlayer.name,
          index: 0,
        }],
      }
    })
  const response = {
    type: MessageType.UPDATE_ROOM,
    data: JSON.stringify(availableRooms),
    id: 0,
  };
  return JSON.stringify(response);
} 