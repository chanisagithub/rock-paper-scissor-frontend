import React from 'react';

const Lobby = ({ onConnectWallet }) => {
  console.log("Lobby component rendered.");
  console.log("onConnectWallet prop:", onConnectWallet);
  return (
    <div>
      <h1>Decentralized Rock-Paper-Scissors</h1>
      <button onClick={() => { console.log("Connect Wallet button clicked."); onConnectWallet(); }}>Connect Wallet</button>
    </div>
  );
};

export default Lobby;

