import React from 'react';
import DashboardAlunos from './components/DashboardAlunos';
import './App.css';

function App() {
  return (
    <>
      {/* Renderiza a tela de Dashboard e Alunos desenvolvida pelo Enzo */}
      <DashboardAlunos />
      
      {/* Rodapé sutil com a marca da academia */}
      <footer style={{ 
        padding: '24px', 
        borderTop: '1px solid var(--border)', 
        color: 'var(--text)', 
        fontSize: '0.85rem',
        marginTop: 'auto' 
      }}>
        <p>&copy; {new Date().getFullYear()} Academia Olimpo.</p>
      </footer>
    </>
  );
}

export default App;