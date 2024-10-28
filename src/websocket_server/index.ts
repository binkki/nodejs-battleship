import { WebSocketServer, WebSocket } from "ws";
import { config } from 'dotenv';
import { messageHandler } from './handlers'
import { ResponseType, WebSocketWithId } from "./types";


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
    console.log("\x1b[36m", "<- Websocket sent the message: ", "\x1b[0m", message);
    x.wsocket.send(message);
  });
}

export const sendMessageToUsers = (message: string | null) => {
  if (!message) return;
  try {
    const responses : ResponseType[] = JSON.parse(message);
    responses.forEach((response: ResponseType) => {
      webSockets.filter((x: WebSocketWithId) => x.id === response['wsId'])
        .forEach((y: WebSocketWithId) => {
          console.log("\x1b[36m", "<- Websocket sent the message: ", "\x1b[0m", response['message']);
          y.wsocket.send(response['message']);
        });
    });
  } catch (error) { console.log(error) }
}
