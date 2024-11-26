import { WebSocket, RawData } from "ws";
import { Message, MessageType } from "../types";
import { loginUser } from "../models/user";
import { addUserToRoom, createRoom, updateRoom } from "../models/room";
import { sendBroadcastMessage, sendMessageToUsers } from "..";
import { addShips, attack, getTurn, randomAttack } from "../models/game";


export const messageHandler = (ws: WebSocket, websocketId: string, message: RawData) => {
  console.log("\x1b[36m", "-> Websocket got the message: ", "\x1b[0m", message.toString());
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
      sendBroadcastMessage(updateRoom());
      sendMessageToUsers(addUserToRoom(websocketId, JSON.parse(parsedMessage.data)));
      break;
    case MessageType.ADD_SHIPS:
      const addShipResponse = addShips(parsedMessage.data);
      sendMessageToUsers(addShipResponse);
      if (addShipResponse !== null) sendMessageToUsers(getTurn(parsedMessage.data));
      break;
    case MessageType.ATTACK:
      const attackResponse = attack(parsedMessage.data);
      if (attackResponse !== null) {
        sendMessageToUsers(attackResponse);
        sendMessageToUsers(getTurn(parsedMessage.data));  
      }
      break;
    case MessageType.RANDOM_ATTACK:
      const randomAttackResponse = randomAttack(parsedMessage.data);
      if (randomAttackResponse !== null) {
        sendMessageToUsers(randomAttackResponse);
        sendMessageToUsers(getTurn(parsedMessage.data));  
      }
      break;  
    default:
      process.exit();
  }
}

export const sendMessage = (ws: WebSocket, message: string | null) => {
  if (!message) return;
  console.log("\x1b[36m", "<- Websocket sent the message: ", "\x1b[0m", message);
  ws.send(message);
}