import { WebSocketServer, WebSocket } from "ws";
import { config } from 'dotenv';
import { messageHandler } from './handlers'
import { User } from "./types";


config();
const port = Number(process.env.WEBSOCKET_PORT) ?? 3000;

export const wsServer = new WebSocketServer({ 
  port,
 }, () => {
  console.log(`Start websocket server on the ${port} port!`);
});

wsServer.on("connection", (ws: WebSocket, req) => {
  ws.on("error", console.error);
  ws.on("message", (message) => {
    messageHandler(ws, req.headers['sec-websocket-key'] ?? "", message);
  });
});

wsServer.on('close', () => console.log('Websocket client has disconnected!'));


export const sendBroadcastMessage = (message: string | null) => {
  if (!message) return;
  wsServer.clients.forEach((x: WebSocket) => {
    console.log(`<- Websocket sent the message: ${message}`);
    x.send(message);
  });
}
