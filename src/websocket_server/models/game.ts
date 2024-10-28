import { AttackType, BoardTile, Game, Message, MessageType, Ship } from "../types";

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

export const generateBoard = (ships: Ship[] | null) : BoardTile[] => {
  const generatedBoard = Array<BoardTile>(100);
  for (let i = 0; i < 100; i += 1) {
    const tileX = Math.floor(i / 10);
    generatedBoard[i] = {
      status: AttackType.MISS,
      x: tileX,
      y: i - (tileX * 10),
      shipId: -1,
    }
  }
  let shipCount = 0;
  ships?.forEach((currentShip: Ship) => {
    const { position, direction, length, type } = currentShip;
    const { x, y } = JSON.parse(JSON.stringify(position));
    if (direction) {
      for (let i = y; i < y + length; i += 1) {
        const newTile : BoardTile = {
          status: AttackType.MISS,
          x,
          y: i,
          shipId: shipCount,
        };
        const index = i * 10 + x;
        generatedBoard[index] = newTile;
      }
      shipCount += 1;
    } else {
      for (let i = x; i < x + length; i += 1) {
        const newTile : BoardTile = {
          status: AttackType.MISS,
          x: i,
          y,
          shipId: shipCount,
        };
        const index = i * 10 + x;
        generatedBoard[index] = newTile;
      }
      shipCount += 1;
    }
  });
  return generatedBoard;
}

const getAttackResult = (game: Game, playerId: string, x: number, y: number) : AttackType | null => {
  const board = playerId === game.player1
    ? game.player2Board
    : game.player1Board;
  if (board === null) return null;
  const index = y * 10 + x;
  if (board[index].shipId < 0) return AttackType.MISS;
  if (board[index].status === AttackType.SHOT || board[index].status === AttackType.KILLED) return null;
  const shipId = board[index].shipId;
  games.forEach((x: Game) => {
    if (x.gameId === game.gameId) {
      if (x.player2Board && playerId === game.player1) {
        x.player2Board[index].status = AttackType.SHOT;
      } else if (x.player1Board && playerId === game.player2) {
        x.player1Board[index].status = AttackType.SHOT;
      }
    }
  });
  board[index].status = AttackType.SHOT;
  const isShipKilled = checkShipKilled(game, playerId, shipId);
  if (isShipKilled) {
    games.forEach((x: Game) => {
      if (x.gameId === game.gameId) {
        if (playerId === game.player1) {
          for (let i = 0; i < 100; i += 1) {
            if (x.player2Board && x.player2Board[i].shipId === shipId)
              x.player2Board[i].status = AttackType.KILLED;
          }
        } else {
          for (let i = 0; i < 100; i += 1) {
            if (x.player1Board && x.player1Board[i].shipId === shipId)
              x.player1Board[i].status = AttackType.KILLED;
          }
        }
      }
    });
    return AttackType.KILLED;
  } else return AttackType.SHOT;
}

const checkShipKilled = (game: Game, playerId: string, shipId: number) : AttackType => {
  const board = playerId === game.player1
    ? game.player1Board
    : game.player2Board;
  if (game.player1Field === null || game.player2Field === null) return AttackType.MISS;
  const ship = playerId === game.player1
  ? game.player1Field[shipId]
  : game.player2Field[shipId];
  const shipTiles = board?.filter((x: BoardTile) => 
    x.shipId === shipId && x.status !== AttackType.MISS
  );
  return shipTiles?.length !== ship.length ? AttackType.KILLED : AttackType.MISS;
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
