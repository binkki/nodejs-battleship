import { ChildProcess, exec } from "child_process";
import { httpServer } from "./src/http_server/index.js";


const terminateEvents = ['exit', 'SIGINT', 'SIGTERM', 'SIGKILL'];

const runNpmCommand = (command: string) : ChildProcess => {
  let child = exec(`npm run ${command}`);
  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);
  return child;
}

const terminateChild = () => {
  httpServer.close();
  frontend.kill();
  wsServer.kill();
};

for (let event in terminateEvents) {
  process.on(event, terminateChild);
}

const frontend = runNpmCommand('start-frontend');
const wsServer = runNpmCommand('start-ws');
