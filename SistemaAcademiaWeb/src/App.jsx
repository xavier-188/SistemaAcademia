import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <footer style={{
          padding: '24px',
          borderTop: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: '0.85rem',
          marginTop: 'auto'
        }}>
          <p>&copy; {new Date().getFullYear()} Academia Olimpo.</p>
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;