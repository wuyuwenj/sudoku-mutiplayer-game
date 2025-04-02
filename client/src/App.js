import React from 'react';
import styled from 'styled-components';
import Game from './components/Game';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const Header = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
`;
        
const Title = styled.h1`
  margink: 0;
  font-size: 2.5em;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>Multiplayer Sudoku</Title>
      </Header>
      <Game />
    </AppContainer>
  );
}

export default App;
