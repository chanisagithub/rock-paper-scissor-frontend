import React from 'react';

const Result = ({ winner, onRematch, currentPlayer, opponent, gameState }) => {
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

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>🎮 Game Over! 🎮</h2>
      
      {/* Winner Announcement */}
      <div style={{ 
        backgroundColor: istie ? '#FFC107' : (currentPlayerWon ? '#4CAF50' : '#FF5722'), 
        color: istie ? '#333' : 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px' 
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
          {istie ? '🤝 IT\'S A TIE! 🤝' : (currentPlayerWon ? '🎉 YOU WIN! 🎉' : '😔 YOU LOSE 😔')}
        </h3>
        {istie ? (
          <p style={{ margin: '0', fontSize: '18px' }}>
            Great game! Both players played equally well!
          </p>
        ) : winnerInfo && (
          <p style={{ margin: '0', fontSize: '18px' }}>
            {winnerInfo.name} is the champion!
          </p>
        )}
      </div>

      {/* Final Scores */}
      {gameState && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginBottom: '30px',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>YOU</h4>
            {currentPlayer && (
              <>
                <img 
                  src={currentPlayer.nftImageUrl} 
                  alt="Your NFT" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    border: istie ? '4px solid #FFC107' : (currentPlayerWon ? '4px solid #4CAF50' : '4px solid #ccc')
                  }}
                />
                <p style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>{currentPlayer.name}</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
                  {gameState.player1Score || 0} wins
                </p>
              </>
            )}
          </div>
          
          <div style={{ alignSelf: 'center', fontSize: '32px' }}>⚔️</div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#FF5722', margin: '0 0 10px 0' }}>OPPONENT</h4>
            {opponent && (
              <>
                <img 
                  src={opponent.nftImageUrl} 
                  alt="Opponent NFT" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    border: istie ? '4px solid #FFC107' : (!currentPlayerWon ? '4px solid #4CAF50' : '4px solid #ccc')
                  }}
                />
                <p style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>{opponent.name}</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
                  {gameState.player2Score || 0} wins
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Final Score Summary */}
      {gameState && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Final Score: {gameState.player1Score || 0} - {gameState.player2Score || 0}</h3>
          <p style={{ color: '#666' }}>
            {istie ? '🤝 Perfect balance! ' : ''}Best of {gameState.maxRounds || 3} rounds completed
          </p>
        </div>
      )}

      {/* Play Again Button */}
      <button 
        onClick={onRematch}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
      >
        🔄 Play Again
      </button>
    </div>
  );
};

export default Result;

