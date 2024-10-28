import { Game, Message, MessageType } from "../types";

const games : Game[] = [];

export const addShips = (data: string) : string | null => {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  const game = games
    .filter((x: Game) => x.gameId === gameId 
        && (x.player1 === indexPlayer || x.player2 === indexPlayer)
    );
  if (game.length === 0) return null;
  if (game[0].player1 === indexPlayer) {
    game[0].player1Field = ships;
  }
  if (game[0].player2 === indexPlayer) {
    game[0].player2Field = ships;
  }
  if (!game[0].player1Field || !game[0].player2Field) {
    return null;
  }
  const responsePlayer1 = JSON.stringify({
    wsId: game[0].player1,
    message: {
      type: MessageType.START_GAME,
      data:
        {
          ships: game[0].player1Field,
          currentPlayerIndex: game[0].player1,
        },
      id: 0,
    }    
  });
  const responsePlayer2 = JSON.stringify({
    wsId: game[0].player2,
    message: {
      type: MessageType.START_GAME,
      data:
        {
          ships: game[0].player2Field,
          currentPlayerIndex: game[0].player2,
        },
      id: 0,
    }    
  });
  return JSON.stringify([responsePlayer1, responsePlayer2]);
}

export const createGame = (id1: string, id2: string) : Game => {
  const newGame : Game = {
    gameId: games.length,
    player1: id1,
    player1Field: null,
    player2: id2,
    player2Field: null,
  }
  games.push(newGame);
  return newGame;
}