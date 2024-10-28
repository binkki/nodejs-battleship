import { WebSocket, RawData } from "ws";
import { Message, MessageType } from "../types";
import { loginUser } from "../models/user";
import { addUserToRoom, createRoom, updateRoom } from "../models/room";
import { send } from "process";
import { sendBroadcastMessage } from "..";


export const messageHandler = (ws: WebSocket, websocketId: string, message: RawData) => {
  console.log(`-> Websocket got the message: ${message.toString()}`);
  const parsedMessage: Message = JSON.parse(message.toString());
  switch (parsedMessage.type) {
    case MessageType.USER_LOGIN:
      sendMessage(ws, loginUser({
        ...JSON.parse(parsedMessage.data),
        wsId: websocketId,
      }));
      sendBroadcastMessage(updateRoom());
      break;
    case MessageType.CREATE_ROOM:
      sendMessage(ws, createRoom(websocketId));
      sendBroadcastMessage(updateRoom());
      break;  
    case MessageType.ADD_TO_ROOM:
      const response = addUserToRoom(websocketId, JSON.parse(parsedMessage.data));
      sendBroadcastMessage(updateRoom());
      sendBroadcastMessage(response);
      break;
    default:
      process.exit();
  }
}

export const sendMessage = (ws: WebSocket, message: string | null) => {
  if (!message) return;
  console.log(`<- Websocket sent the message: ${message}`);
  ws.send(message);
}