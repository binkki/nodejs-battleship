import { WebSocketServer, WebSocket } from "ws";
import { config } from 'dotenv';
import { messageHandler } from './handlers'


config();
const port = Number(process.env.WEBSOCKET_PORT) ?? 3000;

export const wsServer = new WebSocketServer({ 
  port,
 }, () => {
  console.log(`Start websocket server on the ${port} port!`);
});

wsServer.on("connection", (ws: WebSocket) => {
  ws.on("error", console.error);
  ws.on("message", (message) => messageHandler(ws, message));
});

wsServer.on('close', () => console.log('Websocket client has disconnected!'))