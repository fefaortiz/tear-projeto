import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login';
import { RegisterPage } from './pages/register';
import { InitialPage } from './pages/initial';
import { RequireAuth } from './components/RequireAuth';
import { RegisterSelectPage } from './pages/register-select';
import { RegisterTherapistPage } from './pages/register-therapist';
import  RegisterCaregiverPage  from './pages/register-caregiver';
import RegisterPatientPage from './pages/register-patient';
import PaginaTesteModal from './PaginaTesteModal';
import LandingPage from './pages/landing';

function App() {
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-screen mx-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/select" element={<RegisterSelectPage />} />
          <Route path="/register/therapist" element={<RegisterTherapistPage />} />
          <Route path="/register/caregiver" element={<RegisterCaregiverPage />} />
          <Route path="/register/patient" element={<RegisterPatientPage />} />
          <Route path="/teste-modal" element={<PaginaTesteModal />} />
          <Route path="/initial" element={
          <RequireAuth>
            <InitialPage />
          </RequireAuth>
      } />

        </Routes>
      </div>
    </div>
  );
}

export default App;