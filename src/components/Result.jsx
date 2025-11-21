import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import '../App.css';

const Result = ({ winner, onRematch, currentPlayer, opponent, gameState, onReturnToMenu }) => {
  // Determine if current player won, lost, or tied
  const istie = !winner || winner === null;
  const currentPlayerWon = !istie && winner && currentPlayer && (winner === currentPlayer.sessionId || 
    (gameState && gameState.players && gameState.players.get(winner)?.uuid === currentPlayer.uuid));
  
  const getWinnerInfo = () => {
    if (istie || !winner || !gameState || !gameState.players) return null;
    
    const winnerData = gameState.players.get(winner);
    if (!winnerData) return null;
    
    return winnerData;
  };

  const winnerInfo = getWinnerInfo();

  const getResultColor = () => {
    if (istie) return 'border-gray-300 bg-gray-50';
    return currentPlayerWon ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-50';
  };

  const getResultIcon = () => {
    if (istie) return '🤝';
    return currentPlayerWon ? '🎉' : '😔';
  };

  const getResultTitle = () => {
    if (istie) return 'IT\'S A TIE!';
    return currentPlayerWon ? 'YOU WIN!' : 'YOU LOSE';
  };

  const getResultMessage = () => {
    if (istie) return 'Great game! Both players played equally well!';
    return winnerInfo ? `${winnerInfo.name} is the champion!` : '';
  };

  return (
    <div className="no-overflow result-wrapper max-w-4xl mx-auto">
      {/* Game Over Header */}
      <Card className={`${getResultColor()} border-2 shadow-lg w-full`}>
        <CardHeader className="text-center bg-gradient-to-b from-gray-50 to-white rounded-t-lg">
          <div className="text-6xl mb-4">{getResultIcon()}</div>
          <CardTitle className="text-3xl font-bold text-black mb-2">
            Game Over!
          </CardTitle>
          <div className={`text-2xl font-bold mb-4 ${
            istie ? 'text-gray-600' : (currentPlayerWon ? 'text-black' : 'text-gray-600')
          }`}>
            {getResultTitle()}
          </div>
          <p className="text-lg text-gray-600">
            {getResultMessage()}
          </p>
        </CardHeader>
      </Card>

      {/* Final Score Display */}
      {gameState && (
        <Card className="bg-white border-gray-200 shadow-lg w-full">
          <CardHeader className="text-center bg-gray-50 rounded-t-lg">
            <CardTitle className="text-xl text-black">Final Score</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="score-grid">
              {/* Current Player Result */}
              <Card className={`border-2 shadow-md ${istie ? 'border-gray-300' : (currentPlayerWon ? 'border-black' : 'border-gray-300')}`}>
                <CardContent className="text-center pt-6 space-y-4">
                  <div className="text-lg font-semibold text-black">YOU</div>
                  {currentPlayer && (
                    <>
                      <Avatar className={`w-24 h-24 mx-auto border-4 ${istie ? 'border-gray-400' : (currentPlayerWon ? 'border-black' : 'border-gray-300')}`}>
                        <AvatarImage src={currentPlayer.nftImageUrl} alt="Your Avatar" />
                        <AvatarFallback className="bg-gray-200 text-black text-xl font-bold">
                          {currentPlayer.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-black">{currentPlayer.name}</p>
                        <Badge className={`text-xl px-4 py-2 mt-2 ${istie ? 'bg-gray-600' : (currentPlayerWon ? 'bg-black' : 'bg-gray-500')} text-white`}>
                          {gameState.player1Score || 0} wins
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* VS Section */}
              <Card className="border-gray-200 shadow-md bg-white">
                <CardContent className="flex flex-col items-center justify-center h-full pt-6">
                  <div className="text-4xl mb-4 text-gray-600">⚔️</div>
                  <Badge variant="outline" className="text-lg px-4 py-2 border-gray-300 text-gray-700">
                    {gameState.player1Score || 0} - {gameState.player2Score || 0}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {istie ? '🤝 Perfect balance!' : ''} Best of {gameState.maxRounds || 3} rounds
                  </p>
                </CardContent>
              </Card>

              {/* Opponent Result */}
              <Card className={`border-2 shadow-md ${istie ? 'border-gray-300' : (!currentPlayerWon ? 'border-black' : 'border-gray-300')}`}>
                <CardContent className="text-center pt-6 space-y-4">
                  <div className="text-lg font-semibold text-black">OPPONENT</div>
                  {opponent && (
                    <>
                      <Avatar className={`w-24 h-24 mx-auto border-4 ${istie ? 'border-gray-400' : (!currentPlayerWon ? 'border-black' : 'border-gray-300')}`}>
                        <AvatarImage src={opponent.nftImageUrl} alt="Opponent Avatar" />
                        <AvatarFallback className="bg-gray-200 text-black text-xl font-bold">
                          {opponent.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-black">{opponent.name}</p>
                        <Badge className={`text-xl px-4 py-2 mt-2 ${istie ? 'bg-gray-600' : (!currentPlayerWon ? 'bg-black' : 'bg-gray-500')} text-white`}>
                          {gameState.player2Score || 0} wins
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="bg-white border-gray-200 shadow-lg w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={onRematch}
              className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 text-lg shadow-lg transition-all duration-200 u-btn"
              size="lg"
            >
              🔄 Play Again
            </Button>
            
            <Button 
              onClick={onReturnToMenu}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-8 py-3 text-lg transition-all duration-200 u-btn"
              size="lg"
            >
              ← Return to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Result;
