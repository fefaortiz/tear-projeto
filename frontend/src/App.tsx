import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { InitialPage } from './pages/initial';
import { RequireAuth } from './components/RequireAuth';


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
      <Route path="/register" element={<RegisterPage />} />

      {/* Exemplo de uma rota protegida no futuro */}
      <Route path="/home" element={<HomePage />} /> 
      <Route path="/initial" element={
        <RequireAuth>
          <InitialPage />
        </RequireAuth>
      } />
    </Routes>
  );
}

export default App;