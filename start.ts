import { ChildProcess, exec } from "child_process";

const runNpmCommand = (command: string) : ChildProcess => {
  let child = exec(`npm run ${command}`);
  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);
  return child;
}

process.on('exit', () => {
  frontend.kill();
  wsServer.kill();
});

const frontend = runNpmCommand('start-frontend');
const wsServer = runNpmCommand('start-ws');
