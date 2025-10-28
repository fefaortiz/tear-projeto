import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { InitialPage } from './pages/initial';
import { RequireAuth } from './components/RequireAuth';
import { RegisterSelectPage } from './pages/register-select';
import { RegisterTherapistPage } from './pages/register-therapist';
import  RegisterCaregiverPage  from './pages/register-caregiver';
import RegisterPatientPage from './pages/register-patient';

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
      <Route path="/register/select" element={<RegisterSelectPage />} />
      <Route path="/register/therapist" element={<RegisterTherapistPage />} />
      <Route path="/register/caregiver" element={<RegisterCaregiverPage />} />
      <Route path="/register/patient" element={<RegisterPatientPage />} />

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