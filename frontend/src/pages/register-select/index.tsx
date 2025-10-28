// src/pages/register-select/index.tsx
import { useNavigate } from 'react-router-dom';
import './style.css'; // Crie este arquivo para estilização
import { Link } from 'react-router-dom';

export function RegisterSelectPage() {
  const navigate = useNavigate();

  const handleSelectProfile = (profileType: string) => {
    navigate(`/register/${profileType}`);
  };

  return (
    <div className="register-select-container">
      <h2>Que tipo de usuário você é?</h2>
      <div className="profile-options">
        <button onClick={() => handleSelectProfile('therapist')}>
          Profissional de Saúde (Terapeuta)
        </button>
        <button onClick={() => handleSelectProfile('caregiver')}>
          Cuidador
        </button>
        <button onClick={() => handleSelectProfile('patient')}>
          Paciente
        </button>
      </div>
        <p className="toggle-link">
          Já tem uma conta? <Link to="/login">Faça o login</Link>
        </p>
    </div>
  );
}

