import React, { useState, useEffect, useRef } from 'react';
import * as Colyseus from 'colyseus.js'; // Import Colyseus client
import Lobby from './components/Lobby';
import Game from './components/Game';
import Result from './components/Result';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import './App.css';

const BACKEND_API_URL = 'http://192.168.1.7:2568'; // Express API port
const COLYSEUS_WS_URL = 'ws://192.168.1.7:2567'; // Colyseus WebSocket port

function App() {
  console.log("App component rendered.");
  const [menuOpen, setMenuOpen] = useState(true); // Show menu initially
  const [gameStarted, setGameStarted] = useState(false);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null); // { winner: 'Player1' } or { winner: null } for draw
  const [message, setMessage] = useState('Welcome! Create or join a room to start playing.');
  const [room, setRoom] = useState(null); // Colyseus Room instance
  const client = useRef(null); // Colyseus Client instance
  
  // Player identification state
  const [currentPlayer, setCurrentPlayer] = useState(null); // { name, uuid, nftImageUrl }
  const [opponent, setOpponent] = useState(null); // { name, uuid, nftImageUrl }
  const [gameState, setGameState] = useState(null); // Full game state for scores, etc.
  
  // Room management state
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    client.current = new Colyseus.Client(COLYSEUS_WS_URL);
    return () => {
      if (room) {
        room.leave();
      }
    };
  }, []);

  // Create a new room
  const createRoom = async () => {
    if (!playerName.trim()) {
      setMessage('Please enter your player name.');
      return;
    }

    try {
      const playerUuid = `player_${Math.random().toString(36).substring(7)}`;
      const nftImageUrl = `https://picsum.photos/seed/${playerUuid}/50/50`; // Dummy avatar

      console.log('Creating room...');
      setMessage('Creating room...');
      
      // Create room directly through Colyseus
      const gameRoom = await client.current.create('drps_room', {
        playerUuid,
        playerName: playerName.trim(),
        nftImageUrl
      });

      console.log('Room created with ID:', gameRoom.roomId || gameRoom.id);
      setRoomId(gameRoom.roomId || gameRoom.id);
      
      // Set current player info
      setCurrentPlayer({
        name: playerName.trim(),
        uuid: playerUuid,
        nftImageUrl: nftImageUrl
      });

      setupGameRoom(gameRoom);
      setMenuOpen(false);
      setMessage(`Room created! Room ID: ${gameRoom.roomId || gameRoom.id}. Waiting for opponent...`);

    } catch (error) {
      console.error('Error creating room:', error);
      setMessage('Failed to create room. Please try again.');
    }
  };

  // Join an existing room
  const joinRoom = async () => {
    if (!playerName.trim()) {
      setMessage('Please enter your player name.');
      return;
    }
    
    if (!roomId.trim()) {
      setMessage('Please enter a room ID.');
      return;
    }

    try {
      const playerUuid = `player_${Math.random().toString(36).substring(7)}`;
      const nftImageUrl = `https://picsum.photos/seed/${playerUuid}/50/50`; // Dummy avatar

      console.log('Joining room:', roomId.trim());
      setMessage('Joining room...');
      
      // Join room directly through Colyseus
      const gameRoom = await client.current.joinById(roomId.trim(), {
        playerUuid,
        playerName: playerName.trim(),
        nftImageUrl
      });

      console.log('Joined room:', gameRoom.roomId || gameRoom.id);
      
      // Set current player info
      setCurrentPlayer({
        name: playerName.trim(),
        uuid: playerUuid,
        nftImageUrl: nftImageUrl
      });

      setupGameRoom(gameRoom);
      setMenuOpen(false);
      setMessage('Joined room! Waiting for game to start...');

    } catch (error) {
      console.error('Error joining room:', error);
      setMessage('Failed to join room. Please check the room ID and try again.');
    }
  };

  // Quick match - join or create any available room
  const quickMatch = async () => {
    if (!playerName.trim()) {
      setMessage('Please enter your player name.');
      return;
    }

    try {
      const playerUuid = `player_${Math.random().toString(36).substring(7)}`;
      const nftImageUrl = `https://picsum.photos/seed/${playerUuid}/50/50`; // Dummy avatar

      console.log('Quick matching...');
      setMessage('Finding a match...');
      
      // Try to join or create any available room
      const gameRoom = await client.current.joinOrCreate('drps_room', {
        playerUuid,
        playerName: playerName.trim(),
        nftImageUrl
      });

      console.log('Matched to room:', gameRoom.roomId || gameRoom.id);
      setRoomId(gameRoom.roomId || gameRoom.id);
      
      // Set current player info
      setCurrentPlayer({
        name: playerName.trim(),
        uuid: playerUuid,
        nftImageUrl: nftImageUrl
      });

      setupGameRoom(gameRoom);
      setMenuOpen(false);
      setMessage('Match found! Waiting for game to start...');

    } catch (error) {
      console.error('Error in quick match:', error);
      setMessage('Failed to find a match. Please try again.');
    }
  };

  // Setup game room event handlers
  const setupGameRoom = (gameRoom) => {
    setRoom(gameRoom);

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
      
      // Check if game should start
      if (state.status === 'playing' && !gameStarted) {
        setGameStarted(true);
        setMessage('Game started! Make your choice.');
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
        if (state.winner) {
          setMessage(`${state.players.get(state.winner)?.name} wins the match!`);
        } else {
          setMessage(`It's a tie!`);
        }
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
      setGameStarted(true);
    });

    gameRoom.onMessage('game_over', (message) => {
      setGameResult({ winner: message.winner });
      setGameStarted(false);
      setMessage(message.message);
    });

    gameRoom.onLeave(() => {
      console.log('You left the room');
      if (gameStarted) {
        setMessage('Opponent disconnected. Returning to menu...');
        setGameStarted(false);
        setGameResult({ winner: 'Opponent Disconnected' });
      }
    });
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
    // Reset all game state
    setPlayerChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
    setGameStarted(false);
    setOpponent(null);
    setGameState(null);
    setMenuOpen(true); // Return to menu
    setCurrentPlayer(null);
    setRoomId('');
    setMessage('Game ended. Ready for a new match!');
  };

  const returnToMenu = () => {
    if (room) {
      room.leave(); // Leave current room
    }
    // Reset all state
    setPlayerChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
    setGameStarted(false);
    setOpponent(null);
    setGameState(null);
    setMenuOpen(true);
    setCurrentPlayer(null);
    setRoomId('');
    setMessage('Welcome! Create or join a room to start playing.');
  };

  return (
    <div className="no-overflow min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="container w-full mx-auto max-w-4xl flex items-center justify-center">
        
          {menuOpen ? (
            <Card className="mx-auto max-w-md shadow-2xl bg-white border-gray-200">
              <CardHeader className="text-center bg-gradient-to-b from-gray-50 to-white rounded-t-lg">
                <CardTitle className="text-3xl font-bold text-black mb-2">
                  Rock🪨 Paper📄 Scissors✂️
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Challenge players worldwide in this classic game
                </CardDescription>
                {message && (
                  <Alert className="mt-4 bg-gray-50 border-gray-200">
                    <AlertDescription className="text-gray-700">
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                {/* Player Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-sm font-medium text-gray-900">
                    Player Name
                  </Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full border-gray-300 focus:border-black focus:ring-black bg-white"
                  />
                </div>

                {/* Quick Match Button */}
                <Button
                  onClick={quickMatch}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 shadow-lg transition-all duration-200 u-btn"
                  size="lg"
                >
                  🎮 Quick Match
                </Button>

                <div className="flex items-center justify-center">
                  <Separator className="flex-1 bg-gray-300" />
                  <span className="px-3 text-sm text-gray-500">OR</span>
                  <Separator className="flex-1 bg-gray-300" />
                </div>

                {/* Create Room Section */}
                <Button
                  onClick={createRoom}
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 transition-all duration-200 u-btn"
                  size="lg"
                >
                  🏠 Create Private Room
                </Button>

                <div className="flex items-center justify-center">
                  <Separator className="flex-1 bg-gray-300" />
                  <span className="px-3 text-sm text-gray-500">OR</span>
                  <Separator className="flex-1 bg-gray-300" />
                </div>

                {/* Join Room Section */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="roomId" className="text-sm font-medium text-gray-900">
                      Room ID
                    </Label>
                    <Input
                      id="roomId"
                      type="text"
                      placeholder="Enter Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full border-gray-300 focus:border-black focus:ring-black bg-white"
                    />
                  </div>
                  <Button
                    onClick={joinRoom}
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 transition-all duration-200 u-btn"
                    size="lg"
                  >
                    🚪 Join Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : room && !gameResult ? (
            <Game
              playerChoice={playerChoice}
              opponentChoice={opponentChoice}
              onMakeChoice={makeChoice}
              message={message}
              currentPlayer={currentPlayer}
              opponent={opponent}
              gameState={gameState}
              roomId={roomId}
              onReturnToMenu={returnToMenu}
            />
          ) : (
            <Result 
              winner={gameResult?.winner} 
              onRematch={rematch}
              currentPlayer={currentPlayer}
              opponent={opponent}
              gameState={gameState}
              onReturnToMenu={returnToMenu}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
