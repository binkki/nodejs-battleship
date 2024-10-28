import { WebSocketServer, WebSocket } from "ws";
import { config } from 'dotenv';
import { messageHandler } from './handlers'
import { Message, User, WebSocketWithId } from "./types";


config();
const port = Number(process.env.WEBSOCKET_PORT) ?? 3000;

const webSockets : WebSocketWithId[] = [];

export const wsServer = new WebSocketServer({ 
  port,
 }, () => {
  console.log(`Start websocket server on the ${port} port!`);
});

wsServer.on("connection", (ws: WebSocket, req) => {
  ws.on("error", console.error);
  ws.on("message", (message) => {
    const newSocketId = req.headers['sec-websocket-key'];
    if (webSockets.filter((x: WebSocketWithId) => x.id === newSocketId).length === 0) {
      const newSocket = {
        wsocket: ws,
        id: newSocketId ?? "",
      };
      webSockets.push(newSocket);
    }
    messageHandler(ws, newSocketId ?? "", message);
  });
});

wsServer.on('close', () => console.log('Websocket client has disconnected!'));


export const sendBroadcastMessage = (message: string | null) => {
  if (!message) return;
  webSockets.forEach((x: WebSocketWithId) => {
    console.log(`<- Websocket sent the message: ${message}`);
    x.wsocket.send(message);
  });
}

export const sendMessageToUsers = (message: string | null) => {
  if (!message) return;
  const responses = JSON.parse(message);
  responses.forEach((response: string) => {
    const { wsId, message } = JSON.parse(response);
    webSockets.filter((x: WebSocketWithId) => x.id === wsId)
      .forEach((y: WebSocketWithId) => {
        y.wsocket.send(JSON.stringify(message));
      });
  });
  
}
