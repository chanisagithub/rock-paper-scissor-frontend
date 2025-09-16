import React from 'react';

const Game = ({ playerChoice, opponentChoice, onMakeChoice, message, currentPlayer, opponent, gameState }) => {
  return (
    <div>
      <h2>Rock Paper Scissors - Game in Progress</h2>
      
      {/* Player Identification Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>YOU</h3>
          {currentPlayer && (
            <>
              <img 
                src={currentPlayer.nftImageUrl} 
                alt="Your NFT" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #2196F3' }}
              />
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{currentPlayer.name}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                ID: {currentPlayer.uuid.substring(0, 8)}...
              </p>
            </>
          )}
          {gameState && (
            <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
              Score: {gameState.player1Score || 0}
            </p>
          )}
        </div>
        
        <div style={{ alignSelf: 'center', fontSize: '24px', fontWeight: 'bold' }}>
          VS
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h3 style={{ color: '#FF5722', margin: '0 0 10px 0' }}>OPPONENT</h3>
          {opponent ? (
            <>
              <img 
                src={opponent.nftImageUrl} 
                alt="Opponent NFT" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #FF5722' }}
              />
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{opponent.name}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                ID: {opponent.uuid.substring(0, 8)}...
              </p>
            </>
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px dashed #ccc', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>?</span>
            </div>
          )}
          {gameState && (
            <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
              Score: {gameState.player2Score || 0}
            </p>
          )}
        </div>
      </div>

      {/* Game Status */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{message}</p>
        {gameState && (
          <p style={{ fontSize: '14px', color: '#666' }}>Round: {gameState.round || 1} / {gameState.maxRounds || 3}</p>
        )}
      </div>

      {/* Choices Display */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: '#2196F3' }}>Your Choice:</h4>
          <div style={{ fontSize: '24px', minHeight: '30px' }}>
            {playerChoice ? `${playerChoice} ${getChoiceEmoji(playerChoice)}` : 'Waiting...'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: '#FF5722' }}>Opponent's Choice:</h4>
          <div style={{ fontSize: '24px', minHeight: '30px' }}>
            {opponentChoice ? `${opponentChoice} ${getChoiceEmoji(opponentChoice)}` : 'Waiting...'}
          </div>
        </div>
      </div>

      {/* Choice Buttons */}
      <div style={{ textAlign: 'center' }}>
        <h3>Make Your Choice:</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button 
            onClick={() => onMakeChoice('rock')} 
            disabled={!!playerChoice}
            style={{ 
              padding: '15px 20px', 
              fontSize: '16px', 
              border: 'none', 
              borderRadius: '8px', 
              backgroundColor: playerChoice === 'rock' ? '#4CAF50' : '#f0f0f0',
              color: playerChoice === 'rock' ? 'white' : 'black',
              cursor: playerChoice ? 'not-allowed' : 'pointer',
              opacity: playerChoice && playerChoice !== 'rock' ? 0.5 : 1
            }}
          >
            🪨 Rock
          </button>
          <button 
            onClick={() => onMakeChoice('paper')} 
            disabled={!!playerChoice}
            style={{ 
              padding: '15px 20px', 
              fontSize: '16px', 
              border: 'none', 
              borderRadius: '8px', 
              backgroundColor: playerChoice === 'paper' ? '#4CAF50' : '#f0f0f0',
              color: playerChoice === 'paper' ? 'white' : 'black',
              cursor: playerChoice ? 'not-allowed' : 'pointer',
              opacity: playerChoice && playerChoice !== 'paper' ? 0.5 : 1
            }}
          >
            📄 Paper
          </button>
          <button 
            onClick={() => onMakeChoice('scissors')} 
            disabled={!!playerChoice}
            style={{ 
              padding: '15px 20px', 
              fontSize: '16px', 
              border: 'none', 
              borderRadius: '8px', 
              backgroundColor: playerChoice === 'scissors' ? '#4CAF50' : '#f0f0f0',
              color: playerChoice === 'scissors' ? 'white' : 'black',
              cursor: playerChoice ? 'not-allowed' : 'pointer',
              opacity: playerChoice && playerChoice !== 'scissors' ? 0.5 : 1
            }}
          >
            ✂️ Scissors
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get emoji for choices
const getChoiceEmoji = (choice) => {
  switch(choice) {
    case 'rock': return '🪨';
    case 'paper': return '📄';
    case 'scissors': return '✂️';
    default: return '';
  }
};

export default Game;

