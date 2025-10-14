import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';

// Um componente simples para uma futura página principal
function HomePage() {
  return <h1>Bem-vindo! Você está logado.</h1>
}

function App() {
  return (
    <Routes>
      {/* Redireciona a rota principal '/' para '/login' */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Exemplo de uma rota protegida no futuro */}
      <Route path="/home" element={<HomePage />} /> 
    </Routes>
  );
}

export default App;