import { Message, MessageType, Room } from "../types";
import { getUserById } from "./user";

const rooms: Room[] = [];

export const createRoom = (id: string) : string => {
  const newRoom = {
    player1: id,
    player2: null,
  };
  rooms.push(newRoom);
  const user = getUserById(id);
  const response = {
    type: "update_room",
    data: JSON.stringify([
      {
        roomId: rooms.length - 1,
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