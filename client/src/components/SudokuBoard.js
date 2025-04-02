import React from 'react';
import styled from 'styled-components';

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  background-color: #333;
  padding: 2px;
  width: 450px;
  height: 450px;
  margin: 20px auto;
`;

const Cell = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  ${props => props.isInitial && `
    background-color: #e0e0e0;
    font-weight: bold;
  `}

  ${props => props.isSelected && `
    background-color: #b3d4fc;
  `}

  ${props => props.hasError && `
    background-color: #ffebee;
  `}
`;

const CellInput = styled.input`
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  font-size: 24px;
  outline: none;
  background: transparent;
`;

const SudokuBoard = ({ puzzle, onCellClick, selectedCell, onCellChange, lastMove }) => {
  const handleCellClick = (row, col) => {
    if (puzzle[row][col] === 0) {
      onCellClick(row, col);
    }
  };

  const handleKeyPress = (e, row, col) => {
    if (e.key >= '1' && e.key <= '9') {
      onCellChange(row, col, parseInt(e.key));
    }
  };

  return (
    <Board>
      {puzzle.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            isInitial={cell !== 0}
            isSelected={selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex}
            hasError={lastMove && lastMove.row === rowIndex && lastMove.col === colIndex && lastMove.hasError}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          >
            {cell === 0 ? (
              <CellInput
                type="number"
                min="1"
                max="9"
                onKeyPress={(e) => handleKeyPress(e, rowIndex, colIndex)}
                autoFocus={selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex}
              />
            ) : (
              cell
            )}
          </Cell>
        ))
      )}
    </Board>
  );
};

export default SudokuBoard; 