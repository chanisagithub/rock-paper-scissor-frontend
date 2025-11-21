import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import '../App.css';

const Game = ({ playerChoice, opponentChoice, onMakeChoice, message, currentPlayer, opponent, gameState, roomId, onReturnToMenu }) => {
  const getRoundProgress = () => {
    if (!gameState) return 0;
    const round = gameState.round || 1;
    const max = gameState.maxRounds || 3;
    return ((round - 1) / max) * 100;
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      // Ideally add a toast, but keep simple for now
    }
  };

  return (
    <div className="no-overflow min-h-screen main-container bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 gap-3">
        {/* Room ID */}
        {roomId && (
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="text-white/80 text-sm">Room:</span>
            <Badge className="bg-white text-black font-mono text-sm">
              {roomId}
            </Badge>
            <Button
              onClick={copyRoomId}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6 u-btn"
            >
              📋
            </Button>
          </div>
        )}

        {/* Game Progress */}
        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-white font-bold">🪨📄✂️</span>
          {gameState && (
            <>
              <Badge variant="outline" className="border-white/30 text-white bg-white/5">
                Round {gameState.round || 1}/{gameState.maxRounds || 3}
              </Badge>
              <Progress value={getRoundProgress()} className="w-24" />
            </>
          )}
        </div>

        {/* Menu Button */}
        <Button 
          onClick={onReturnToMenu}
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10 u-btn"
        >
          ← Menu
        </Button>
      </div>

      {/* Main Area */}
      <div className="w-full max-w-4xl">
        {/* Status */}
        <Card className="status-card game-card bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="p-3 center-text">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <p className="text-gray-800 font-medium">{message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Grid: Player - Actions - Opponent */}
        <div className="mt-4 game-grid">
          {/* YOU */}
          <Card className="game-card bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-black text-lg">YOU</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 flex flex-col justify-between h-full">
              {currentPlayer ? (
                <div className="space-y-3">
                  <Avatar className="avatar-small mx-auto">
                    <AvatarImage src={currentPlayer.nftImageUrl} alt="Your Avatar" />
                    <AvatarFallback className="bg-blue-200 text-blue-700 text-lg font-bold">
                      {currentPlayer.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-bold text-black text-base">{currentPlayer.name}</p>
                    {gameState && (
                      <Badge className="bg-blue-600 text-white mt-2">
                        {gameState.player1Score || 0} wins
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">Your Choice</p>
                    <div className="text-3xl mb-1 choice-emoji">
                      {playerChoice ? getChoiceEmoji(playerChoice) : '🤔'}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {playerChoice ? capitalize(playerChoice) : 'Thinking...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8">Waiting for you to join...</div>
              )}
            </CardContent>
          </Card>

          {/* Center Actions */}
          <Card className="game-card bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <CardTitle className="text-black text-lg">Make Your Move</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="space-y-3">
                <Button
                  onClick={() => onMakeChoice('rock')}
                  disabled={!!playerChoice}
                  variant={playerChoice === 'rock' ? 'default' : 'outline'}
                  className={`w-full h-12 text-base font-semibold transition-all duration-200 u-btn ${
                    playerChoice === 'rock' 
                      ? 'bg-black hover:bg-gray-800 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-50 border-gray-300 text-gray-700 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl">🪨</span>
                    <span>Rock</span>
                  </div>
                </Button>

                <Button
                  onClick={() => onMakeChoice('paper')}
                  disabled={!!playerChoice}
                  variant={playerChoice === 'paper' ? 'default' : 'outline'}
                  className={`w-full h-12 text-base font-semibold transition-all duration-200 u-btn ${
                    playerChoice === 'paper' 
                      ? 'bg-black hover:bg-gray-800 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-50 border-gray-300 text-gray-700 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl">📄</span>
                    <span>Paper</span>
                  </div>
                </Button>

                <Button
                  onClick={() => onMakeChoice('scissors')}
                  disabled={!!playerChoice}
                  variant={playerChoice === 'scissors' ? 'default' : 'outline'}
                  className={`w-full h-12 text-base font-semibold transition-all duration-200 u-btn ${
                    playerChoice === 'scissors' 
                      ? 'bg-black hover:bg-gray-800 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-50 border-gray-300 text-gray-700 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl">✂️</span>
                    <span>Scissors</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* OPPONENT */}
          <Card className="game-card bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center py-3 bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="text-black text-lg">OPPONENT</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 flex flex-col justify-between h-full">
              {opponent ? (
                <div className="space-y-3">
                  <Avatar className="avatar-small mx-auto">
                    <AvatarImage src={opponent.nftImageUrl} alt="Opponent Avatar" />
                    <AvatarFallback className="bg-red-200 text-red-700 text-lg font-bold">
                      {opponent.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-black text-base">{opponent.name}</p>
                    {gameState && (
                      <Badge className="bg-red-600 text-white mt-2">
                        {gameState.player2Score || 0} wins
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 font-medium mb-2">Their Choice</p>
                    <div className="text-3xl mb-1 choice-emoji">
                      {opponentChoice ? getChoiceEmoji(opponentChoice) : '🤔'}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {opponentChoice ? capitalize(opponentChoice) : 'Thinking...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-8">
                  <div className="w-16 h-16 mx-auto border-3 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">?</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-base font-medium">Waiting for player...</p>
                    <p className="text-gray-400 text-sm mt-1">Share the Room ID above</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helpers
const getChoiceEmoji = (choice) => {
  switch(choice) {
    case 'rock': return '🪨';
    case 'paper': return '📄';
    case 'scissors': return '✂️';
    default: return '';
  }
};
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default Game;
