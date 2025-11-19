import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import DatavizPage from './pages/dataviz';
import { RequireAuth } from './components/RequireAuth';
import { RegisterSelectPage } from './pages/register-select';
import { RegisterTherapistPage } from './pages/register-therapist';
import RegisterCaregiverPage  from './pages/register-caregiver';
import RegisterPatientPage from './pages/register-patient';
import PaginaTesteModal from './PaginaTesteModal';
import LandingPage from './pages/landing';

// Importa as Home Pages
import { HomePagePatient } from './pages/home-page-patient';
import { HomePageCaregiver } from './pages/home-page-caregiver';
import { HomePageTherapist } from './pages/home-page-therapist';

function App() {
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-screen mx-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/dataviz" element={<DatavizPage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/select" element={<RegisterSelectPage />} />
          <Route path="/register/therapist" element={<RegisterTherapistPage />} />
          <Route path="/register/caregiver" element={<RegisterCaregiverPage />} />
          <Route path="/register/patient" element={<RegisterPatientPage />} />
          <Route path="/teste-modal" element={<PaginaTesteModal />} />
          {/* Rotas de Home Page Baseadas na Role - Todas protegidas */}
          <Route path="/home/paciente" element={
            <RequireAuth>
              <HomePagePatient />
            </RequireAuth>
          } />
          <Route path="/home/cuidador" element={
            <RequireAuth>
              <HomePageCaregiver />
            </RequireAuth>
          } />
          <Route path="/home/terapeuta" element={
            <RequireAuth>
              <HomePageTherapist />
            </RequireAuth>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;