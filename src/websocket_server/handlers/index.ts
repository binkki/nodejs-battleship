import { WebSocket, RawData } from "ws";
import { Message, MessageType } from "../types";
import { loginUser } from "../models/user";

export const messageHandler = (ws: WebSocket, message: RawData) => {
  console.log(`-> Websocket got the message: ${message.toString()}`);
  const parsedMessage: Message = JSON.parse(message.toString());
  switch (parsedMessage.type) {
    case MessageType.USER_LOGIN:
      const response = loginUser(JSON.parse(parsedMessage.data));
      console.log(`<- Websocket sent the message: ${response}`);
      ws.send(response);
      break;
    default:
      process.exit();
  }
}