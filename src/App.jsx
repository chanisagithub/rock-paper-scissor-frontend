import React, { useState, useEffect, useRef } from 'react';
import * as Colyseus from 'colyseus.js'; // Import Colyseus client
import Lobby from './components/Lobby';
import Game from './components/Game';
import Result from './components/Result';
import './App.css';

const BACKEND_API_URL = 'http://192.168.2.79:2568'; // Express API port
const COLYSEUS_WS_URL = 'ws://192.168.2.79:2567'; // Colyseus WebSocket port

function App() {
  console.log("App component rendered.");
  const [walletConnected, setWalletConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null); // { winner: 'Player1' } or { winner: null } for draw
  const [message, setMessage] = useState('Waiting for opponent...');
  const [room, setRoom] = useState(null); // Colyseus Room instance
  const client = useRef(null); // Colyseus Client instance
  
  // Player identification state
  const [currentPlayer, setCurrentPlayer] = useState(null); // { name, uuid, nftImageUrl }
  const [opponent, setOpponent] = useState(null); // { name, uuid, nftImageUrl }
  const [gameState, setGameState] = useState(null); // Full game state for scores, etc.

  useEffect(() => {
    client.current = new Colyseus.Client(COLYSEUS_WS_URL);
    return () => {
      if (room) {
        room.leave();
      }
    };
  }, []);

  // Placeholder for Web3 wallet connection
  const connectWallet = async () => {
    console.log("connectWallet function called.");
    console.log('Connecting wallet...');
    // In a real app, this would connect to MetaMask or similar
    // and fetch NFT data. For now, we'll simulate success.
    const playerUuid = `player_${Math.random().toString(36).substring(7)}`;
    const playerName = `Guest_${Math.random().toString(36).substring(7)}`;
    const nftImageUrl = `https://picsum.photos/seed/${playerUuid}/50/50`; // Dummy NFT image

    // Simulate sending NFT data to backend and getting JWT
    try {
      console.log('Attempting to fetch from:', `${BACKEND_API_URL}/api/create-room`);
      const response = await fetch(`${BACKEND_API_URL}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerUuid,
          playerName,
          nftImageUrl,
        }),
      });
      console.log('Fetch response status:', response.status);
      const data = await response.json();
      console.log('Fetch response data:', data);
      if (response.ok) {
        setWalletConnected(true);
        setMessage('Wallet connected. Searching for opponent...');
        // Pass all player info and token to joinGame
        joinGame({
          token: data.token,
          playerUuid,
          playerName,
          nftImageUrl
        });
        
        // Set current player info
        setCurrentPlayer({
          name: playerName,
          uuid: playerUuid,
          nftImageUrl: nftImageUrl
        });
      } else {
        setMessage(`Failed to connect: ${data.message}`);
        console.error('Backend error response:', data);
      }
    } catch (error) {
      console.error('Error connecting wallet or creating room:', error);
      setMessage('Error connecting to game server. Check console for details.');
    }
  };

  // Accepts an object with token, playerUuid, playerName, nftImageUrl
  const joinGame = async ({ token, playerUuid, playerName, nftImageUrl }) => {
    try {
      let gameRoom;

      // Always send all required player info and token in join/create options
      const joinOptions = { token, playerUuid, playerName, nftImageUrl };

      // Try different connection approaches to handle various server configurations
      const connectionAttempts = [
        // Attempt 1: Try with all info as direct option
        async () => {
          console.log('Trying with all player info and token as direct option...');
          return await client.current.joinOrCreate('drps_room', joinOptions);
        },
        // Attempt 2: Try with token as playerToken (legacy)
        async () => {
          console.log('Trying with playerToken...');
          return await client.current.joinOrCreate('drps_room', { playerToken: token, playerUuid, playerName, nftImageUrl });
        },
        // Attempt 3: Try with authorization header
        async () => {
          console.log('Trying with authorization header...');
          return await client.current.joinOrCreate('drps_room', { playerUuid, playerName, nftImageUrl }, {
            'Authorization': `Bearer ${token}`
          });
        },
        // Attempt 4: Try to join existing room with all info
        async () => {
          console.log('Trying to join existing room with all info...');
          return await client.current.join('drps_room', joinOptions);
        },
        // Attempt 5: Try create with all info
        async () => {
          console.log('Trying create with all info...');
          return await client.current.create('drps_room', joinOptions);
        }
      ];

      let lastError;
      for (const attempt of connectionAttempts) {
        try {
          gameRoom = await attempt();
          console.log('Successfully connected to room:', gameRoom.roomId || gameRoom.id);
          break;
        } catch (error) {
          console.log('Connection attempt failed:', error.message);
          lastError = error;
          // Continue to next attempt
        }
      }

      if (!gameRoom) {
        throw lastError || new Error('All connection attempts failed');
      }

      setRoom(gameRoom);
      setGameStarted(true);
      setMessage('Opponent found! Make your choice.');

      gameRoom.onStateChange((state) => {
        console.log('State changed:', state);
        setGameState(state); // Store full game state
        
        // Identify current player and opponent
        const currentPlayerSessionId = gameRoom.sessionId;
        const allPlayerSessionIds = Array.from(state.players.keys());
        const opponentSessionId = allPlayerSessionIds.find(id => id !== currentPlayerSessionId);
        
        // Set opponent info
        if (opponentSessionId && state.players.get(opponentSessionId)) {
          const opponentData = state.players.get(opponentSessionId);
          setOpponent({
            name: opponentData.name,
            uuid: opponentData.uuid,
            nftImageUrl: opponentData.nftImageUrl,
            sessionId: opponentSessionId
          });
        }
        
        // Determine which player is which for choice display
        const isPlayer1 = allPlayerSessionIds[0] === currentPlayerSessionId;
        
        if (state.player1Choice && state.player2Choice) {
          // Both players made a choice, show results for the round
          setPlayerChoice(isPlayer1 ? state.player1Choice : state.player2Choice);
          setOpponentChoice(isPlayer1 ? state.player2Choice : state.player1Choice);
        } else if (state.player1Choice) {
          if (isPlayer1) {
            setPlayerChoice(state.player1Choice);
            setOpponentChoice(null);
          } else {
            setPlayerChoice(null);
            setOpponentChoice(state.player1Choice);
          }
        } else if (state.player2Choice) {
          if (isPlayer1) {
            setPlayerChoice(null);
            setOpponentChoice(state.player2Choice);
          } else {
            setPlayerChoice(state.player2Choice);
            setOpponentChoice(null);
          }
        } else {
          setPlayerChoice(null);
          setOpponentChoice(null);
        }

        if (state.status === 'gameOver') {
          setGameResult({ winner: state.winner });
          setGameStarted(false);
          setMessage(`${state.players.get(state.winner)?.name} wins the match!`);
        }
      });

      gameRoom.onMessage('round_start', (message) => {
        setMessage(message.message);
        setPlayerChoice(null);
        setOpponentChoice(null);
      });

      gameRoom.onMessage('round_end', (message) => {
        setMessage(message.message);
        // Update scores or other round-specific info if needed
      });

      gameRoom.onMessage('game_start', (message) => {
        setMessage(message.message);
      });

      gameRoom.onMessage('game_over', (message) => {
        setGameResult({ winner: message.winner });
        setGameStarted(false);
        setMessage(message.message);
      });

      gameRoom.onLeave(() => {
        console.log('You left the room');
        if (gameStarted) {
          setMessage('Opponent disconnected. Returning to matchmaking...');
          setGameStarted(false);
          setGameResult({ winner: 'Opponent Disconnected' });
        }
      });

    } catch (e) {
      console.error('JOIN ERROR', e);
      console.error('Error details:', {
        message: e.message,
        code: e.code,
        name: e.name,
        stack: e.stack
      });

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to join game: ';
      if (e.message.includes('onAuth failed')) {
        errorMessage += 'Authentication failed. The server may not be configured for authentication or the token format is incorrect.';
      } else if (e.message.includes('rootSchema is not a constructor')) {
        errorMessage += 'Server schema error. The game room may not be properly configured on the server side.';
      } else if (e.message.includes('no available rooms')) {
        errorMessage += 'No rooms available. Try again in a moment.';
      } else if (e.message.includes('connection')) {
        errorMessage += 'Connection failed. Please check if the game server is running.';
      } else if (e.message.includes('room not found')) {
        errorMessage += 'Room not found. The server may not have the drps_room configured.';
      } else {
        errorMessage += e.message;
      }

      setMessage(errorMessage);
      setWalletConnected(false); // Allow re-connecting wallet/retrying
    }
  };

  const makeChoice = (choice) => {
    if (room) {
      room.send('make_choice', { choice });
      setPlayerChoice(choice);
      setMessage(`You chose ${choice}. Waiting for opponent...`);
    }
  };

  const rematch = () => {
    if (room) {
      room.leave(); // Leave current room
    }
    setPlayerChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
    setGameStarted(false);
    setOpponent(null); // Reset opponent info
    setGameState(null); // Reset game state
    setMessage('Returning to matchmaking...');
    connectWallet(); // Re-initiate the full flow
  };

  return (
    <div className="App">
      {!walletConnected ? (
        <Lobby onConnectWallet={connectWallet} />
      ) : gameStarted ? (
        <Game
          playerChoice={playerChoice}
          opponentChoice={opponentChoice}
          onMakeChoice={makeChoice}
          message={message}
          currentPlayer={currentPlayer}
          opponent={opponent}
          gameState={gameState}
        />
      ) : (
        <Result 
          winner={gameResult?.winner} 
          onRematch={rematch}
          currentPlayer={currentPlayer}
          opponent={opponent}
          gameState={gameState}
        />
      )}
    </div>
  );
}

export default App;

