import { WebSocketServer } from "ws";
import { config } from 'dotenv';


config();
const port = Number(process.env.WEBSOCKET_PORT) ?? 3000;

export const wsServer = new WebSocketServer({ port }, () => {
  console.log(`Start websocket server on the ${port} port!`);
});
