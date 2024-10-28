import {AttackType, BoardTile, Game, MessageType, Ship} from "../types";

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
    game[0].player1Board = generateBoard(ships);
  }
  if (game[0].player2 === indexPlayer) {
    game[0].player2Field = ships;
    game[0].player2Board = generateBoard(ships);
  }
  if (!game[0].player1Field || !game[0].player2Field) {
    return null;
  }
  const responsePlayer1 = ({
    wsId: game[0].player1,
    message: JSON.stringify({
      type: MessageType.START_GAME,
      data: JSON.stringify({
          ships: game[0].player1Field,
          currentPlayerIndex: game[0].player1,
        }),
      id: 0,
    })    
  });
  const responsePlayer2 = ({
    wsId: game[0].player2,
    message: JSON.stringify({
      type: MessageType.START_GAME,
      data: JSON.stringify({
          ships: game[0].player2Field,
          currentPlayerIndex: game[0].player2,
        }),
      id: 0,
    })   
  });
  return JSON.stringify([responsePlayer1, responsePlayer2]);
}

export const createGame = (id1: string, id2: string) : Game => {
  const newGame : Game = {
    gameId: games.length,
    player1: id1,
    player1Field: null,
    player1Board: null,
    player2: id2,
    player2Field: null,
    player2Board: null,
    turn: id1,
  }
  games.push(newGame);
  return newGame;
}

export const attack = (data: string) : string | null => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const game = games.filter((x: Game) => gameId === x.gameId);
  if (game.length === 0) return null;
  if (indexPlayer !== game[0].turn) return null;
  if (indexPlayer !== game[0].player1 && indexPlayer !== game[0].player2) return null;
  const attackStatus = getAttackResult(game[0], game[0].turn, x, y);
  if (attackStatus === null) return null;
  const responseMwssage = {
    type: MessageType.ATTACK,
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: game[0].turn,
      status: attackStatus,
    }),
    id: 0,
  };
  game[0].turn = game[0].turn === game[0].player1
    ? game[0].player2
    : game[0].player1;
  return JSON.stringify([
    {
      wsId: game[0].player1,
      message: JSON.stringify(responseMwssage),
    },
    {
      wsId: game[0].player2,
      message: JSON.stringify(responseMwssage),
    }
  ]);
}

export const generateBoard = (ships: Ship[] | null) : BoardTile[][] => {
  const boardDimensionSize = 10;
  const generatedBoard = Array<BoardTile[]>(boardDimensionSize);
  for (let i = 0; i < boardDimensionSize; i += 1) {
    generatedBoard[i] = Array<BoardTile>(boardDimensionSize);
    for (let j = 0; j < boardDimensionSize; j += 1) {
      generatedBoard[i][j] = {
        status: AttackType.ALIVE,
        shipId: -1
      };
    }
  }
  let shipCount = 0;
  ships?.forEach((currentShip: Ship) => {
    const { position, direction, length, type } = currentShip;
    let { x, y } = JSON.parse(JSON.stringify(position));
    if (direction) {
      for (let i = y; i < y + length; i += 1) {
        generatedBoard[x][i].shipId = shipCount;
      }
    } else {
      for (let i = x; i < x + length; i += 1) {
        generatedBoard[i][y].shipId = shipCount;
      }
    }
    shipCount += 1;
  });
  return generatedBoard;
}

const getAttackResult = (currentGame: Game, playerId: string, x: number, y: number) : AttackType | null => {
  const board = playerId === currentGame.player1
    ? currentGame.player2Board
    : currentGame.player1Board;
  if (board === null) return null;
  if (board[x][y].status !== AttackType.ALIVE) return null;
  board[x][y].status = AttackType.MISS;
  const shipId = board[x][y].shipId;
  if (shipId === -1) return AttackType.MISS;
  else {
    const isShipKilled = checkShipKilled(currentGame, playerId, shipId);
    if (isShipKilled) {
      board.forEach((_: Array<BoardTile>, i: number) => 
        (_: BoardTile, j: number) => board[i][j].status == AttackType.KILLED
      );
      return AttackType.KILLED;
    }
    board[x][y].status = AttackType.SHOT;
    return AttackType.SHOT;
  }
}

const checkShipKilled = (game: Game, playerId: string, shipId: number) : boolean => {
  const board = playerId === game.player1
    ? game.player1Board
    : game.player2Board;
  if (game.player1Field === null || game.player2Field === null) return false;
  const ship = playerId === game.player1
  ? game.player1Field[shipId]
  : game.player2Field[shipId];
  const shipTiles = board?.flat().filter((x: BoardTile) =>
    x.shipId === shipId && x.status === AttackType.SHOT
  );
  return shipTiles?.length !== ship.length;
}

export const getTurn = (data: string) : string | null => {
  const { gameId } = JSON.parse(data);
  const game = games.filter((x: Game) => x.gameId === gameId);
  if (game.length === 0) return null;
  const response = ([
    {
      wsId: game[0].player1,
      message: JSON.stringify({
        type: MessageType.TURN,
        data: JSON.stringify({ currentPlayer: game[0].turn }),
        id: 0,
      })
    },
    {
      wsId: game[0].player2,
      message: JSON.stringify({
        type: MessageType.TURN,
        data: JSON.stringify({ currentPlayer: game[0].turn }),
        id: 0,
      })
    },
  ]);
  return JSON.stringify(response);
}

export const randomAttack = (data: string) : string | null => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const game = games.filter((x: Game) => gameId === x.gameId);
  if (game.length === 0) return null;
  if (indexPlayer !== game[0].turn) return null;
  const board = indexPlayer === game[0].player1
    ? game[0].player2Board
    : game[0].player1Board;
  if (board === null) return null;
  for (let i = 0; i < 10; i += 1) {
    for (let j = 0; j < 10; j += 1) {
      if (board[i][j].status === AttackType.ALIVE) {
        return attack(JSON.stringify({ gameId, x: i, y: j, indexPlayer }));
      } 
    }
  }
  return null;
}
