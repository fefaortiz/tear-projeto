import { useNavigate } from 'react-router-dom';
import styles from'./style.module.css'; 
import { Link } from 'react-router-dom';
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { useState } from 'react';


export function RegisterSelectPage() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook para navegação
  const handleProfileSelect = (profile: string) => {
    setSelectedProfile(profile);
  };

const handleContinue = () => {
    if (selectedProfile) {
      // Navega para a rota específica com base no perfil
      switch (selectedProfile) {
        case 'patient':
          navigate('/register/patient');
          break;
        case 'caregiver':
          navigate('/register/caregiver');
          break;
        case 'therapist':
          navigate('/register/therapist');
          break;
        default:
          break;
      }
    } else {
      alert('Por favor, selecione um perfil para continuar.');
    }
  };

  return (
    <div className={styles.registerSelectBackground}>
      <div className={styles.RegisterSelectContainer}>
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        <h1 className={styles.title}>Bem-vindo!</h1> 
        <h1 className={styles.title}>Selecione o seu tipo de Perfil:</h1>
        <p className={styles.subtitle}>Como você usará a sua conta?</p>

        <div className={styles.profileOptions}>
          <button
            className={`${styles.inputField} ${selectedProfile === 'therapist' ? styles.selected : ''}`}
            onClick={() => handleProfileSelect('therapist')}
          >
            Profissional de Saúde (Terapeuta)
          </button>
          <button
            className={`${styles.inputField} ${selectedProfile === 'caregiver' ? styles.selected : ''}`}
            onClick={() => handleProfileSelect('caregiver')}
          >
            Cuidador
          </button>

          <button
            className={`${styles.inputField} ${selectedProfile === 'patient' ? styles.selected : ''}`}
            onClick={() => handleProfileSelect('patient')}
          >
            Paciente
          </button>

        <button
          className={styles.confirmButton}
          onClick={handleContinue}
          disabled={!selectedProfile}
        >
          Continuar
        </button>
        </div>


          <p className="toggle-link">
            Já tem uma conta? <Link to="/login"> <span className={styles.login} >Entrar</span></Link>
          </p>
      </div>
    </div>
  );
}

