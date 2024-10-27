import { WebSocket, RawData } from "ws";
import { Message, MessageType } from "../types";
import { loginUser } from "../models/user";
import { createRoom } from "../models/room";


export const messageHandler = (ws: WebSocket, websocketId: string, message: RawData) => {
  console.log(`-> Websocket got the message: ${message.toString()}`);
  const parsedMessage: Message = JSON.parse(message.toString());
  switch (parsedMessage.type) {
    case MessageType.USER_LOGIN:
      sendMessage(ws, loginUser({
        ...JSON.parse(parsedMessage.data),
        wsId: websocketId,
      }));
      break;
    case MessageType.CREATE_ROOM:
      sendMessage(ws, createRoom(websocketId));      
      break;  
    default:
      process.exit();
  }
}

export const sendMessage = (ws: WebSocket, message: string) => {
  console.log(`<- Websocket sent the message: ${message}`);
  ws.send(message);
}