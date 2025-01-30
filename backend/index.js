const WebSocket = require('ws');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT;

const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server is running on ws://localhost:${PORT}`);

const games = new Map();

wss.on('connection', (ws) => {
  console.log('New player connected!');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'create_game':
        handleCreateGame(ws);
        break;

      case 'join_game':
        handleJoinGame(ws, data.gameId);
        break;

      case 'make_choice':
        handlePlayerChoice(ws, data.gameId, data.choice);
        break;

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type.' }));
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected.');
    cleanupDisconnectedPlayer(ws);
  });
});

function generateShortId(length = 6) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

function handleCreateGame(ws) {
  const gameId = generateShortId();
  games.set(gameId, { player1: ws, player2: null, choices: {} });
  ws.send(JSON.stringify({ type: 'game_created', gameId }));
  console.log(`Game created with ID: ${gameId}`);
}

function handleJoinGame(ws, gameId) {
  const game = games.get(gameId);

  if (!game) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found.' }));
    return;
  }

  if (game.player2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game already has two players.' }));
    return;
  }

  game.player2 = ws;
  if (game.choices.player1) { 
    ws.send(JSON.stringify({ type: 'choice_made', gameId, message: 'Player 1 has made a choice!' }));
    game.player1.send(JSON.stringify({ type: 'player_joined', message: 'Player 2 has joined the game.' }));
    return;
  };
  ws.send(JSON.stringify({ type: 'game_joined', gameId }));
  game.player1.send(JSON.stringify({ type: 'player_joined', message: 'Player 2 has joined the game.' }));

  console.log(`Player joined game: ${gameId}`);
}

function handlePlayerChoice(ws, gameId, choice) {
  const game = games.get(gameId);

  if (!game) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found.' }));
    return;
  }

  if (ws === game.player1) {
    game.choices.player1 = choice;
    if (game.player2) game.player2.send(JSON.stringify({ type: 'choice_made', message: 'Player 1 has made a choice!' }))
  } else if (ws === game.player2) {
    game.choices.player2 = choice;
    game.player1.send(JSON.stringify({ type: 'choice_made', message: 'Player 2 has made a choice!' }))
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'You are not part of this game.' }));
    return;
  }

  if (game.choices.player1 && game.choices.player2) {
    determineWinner(gameId);
  }
}

function determineWinner(gameId) {
  const game = games.get(gameId);
  const { player1, player2, choices } = game;

  const result = getGameResult(choices.player1, choices.player2);

  console.log(`Player 1 ${result}`);

  player1.send(JSON.stringify({ type: 'game_result', result, yourChoice: choices.player1, opponentChoice: choices.player2 }));
  player2.send(JSON.stringify({ type: 'game_result', result: reverseResult(result), yourChoice: choices.player2, opponentChoice: choices.player1 }));

  games.delete(gameId);
}

function getGameResult(choice1, choice2) {
  if (choice1 === choice2) return 'draw';

  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'scissors' && choice2 === 'paper') ||
    (choice1 === 'paper' && choice2 === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

function reverseResult(result) {
  if (result === 'win') return 'lose';
  if (result === 'lose') return 'win';
  return 'draw';
}

function cleanupDisconnectedPlayer(ws) {
  for (const [gameId, game] of games.entries()) {
    if (game.player1 === ws || game.player2 === ws) {
      games.delete(gameId);
      const otherPlayer = game.player1 === ws ? game.player2 : game.player1;
      if (otherPlayer) {
        otherPlayer.send(JSON.stringify({ type: 'info', message: 'The other player disconnected. Game ended.' }));
      }
      break;
    }
  }
}

module.exports = wss;