import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import SudokuBoard from './SudokuBoard';

const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Scoreboard = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
`;

const PlayerScore = styled.div`
  text-align: center;
  font-size: 18px;
`;

const GameInfo = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;

  &:hover {
    background-color: #45a049;
  }
`;

const socket = io('http://localhost:3001');

const Game = () => {
  const [gameId, setGameId] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    console.log('Setting up socket listeners');
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('gameCreated', ({ gameId, puzzle }) => {
      console.log('Game created or joined:', gameId);
      console.log('Received puzzle:', puzzle);
      setGameId(gameId);
      setPuzzle(puzzle);
    });

    socket.on('playerJoined', ({ players, scores }) => {
      console.log('Player joined event:', { players, scores });
      setPlayers(players);
      setScores(scores);
    });

    socket.on('moveMade', ({ row, col, value, player, scores }) => {
      console.log('Move made:', { row, col, value, player });
      setPuzzle(prev => {
        const newPuzzle = [...prev];
        newPuzzle[row][col] = value;
        return newPuzzle;
      });
      setScores(scores);
      setLastMove({ row, col, value, player });
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      alert(message);
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect');
      socket.off('gameCreated');
      socket.off('playerJoined');
      socket.off('moveMade');
      socket.off('error');
    };
  }, []);

  const createGame = () => {
    socket.emit('createGame');
  };

  const joinGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!gameId) {
      alert('Please enter a game ID');
      return;
    }
    console.log(`Attempting to join game with ID: ${gameId}, player name: ${playerName}`);
    socket.emit('joinGame', { gameId, playerName });
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleCellChange = (row, col, value) => {
    socket.emit('makeMove', { gameId, row, col, value });
    setSelectedCell(null);
  };

  return (
    <GameContainer>
      <GameInfo>
        {!puzzle ? (
          <>
            <Button onClick={createGame}>Create New Game</Button>
            <div style={{ margin: '20px 0' }}>
              <input
                type="text"
                placeholder="Enter game ID"
                value={gameId || ''}
                onChange={(e) => setGameId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Button onClick={joinGame}>Join Game</Button>
            </div>
          </>
        ) : (
          <div>Game ID: {gameId}</div>
        )}
      </GameInfo>

      {puzzle && (
        <>
          <SudokuBoard
            puzzle={puzzle}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            onCellChange={handleCellChange}
            lastMove={lastMove}
          />
          <Scoreboard>
            {scores.map(([playerId, score]) => (
              <PlayerScore key={playerId}>
                {players[playerId]}: {score}
              </PlayerScore>
            ))}
          </Scoreboard>
        </>
      )}
    </GameContainer>
  );
};

export default Game; 