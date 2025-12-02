import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, User, Loader2, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import logoImage from '../../assets/logo_preenchido.png';
import styles from './style.module.css';

// Componentes
import { ProfilePage } from '../../components/profile-page';
import DashboardPageTherapist from '../../components/dashboard-page-therapist';
import { PatientProfileModal } from '../../components/modal-patient-info';

// Interfaces
interface DecodedTokenPayload {
    id: number;
    role: string;
    email: string;
    [key: string]: unknown;
}

interface UserData {
  id: number;
  nome: string;
  email: string;
  role: 'terapeuta';
}

interface Patient {
  idpaciente: number;
  nome: string;
  email: string;
  telefone?: string;
}

const therapistNavigation = [
    { name: 'Meus Pacientes', href: '#patients', icon: Users },
    { name: 'Dashboard Geral', href: '#dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '#profile', icon: User },
];

export const HomePageTherapist = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Meus Pacientes');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Estados de Dados
  const [userData, setUserData] = useState<UserData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal de Perfil do Paciente (NOVO)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<number | null>(null);

  // Autenticação e Carga Inicial
  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode<DecodedTokenPayload>(token);
        
        if (decoded.role !== 'terapeuta') {
            setError('Acesso não autorizado para este perfil.');
            setIsLoading(false);
            return;
        }

        const userId = decoded.id;
        
        setUserData({
            id: userId,
            nome: 'Terapeuta',
            email: decoded.email,
            role: 'terapeuta'
        });

        if (activeItem === 'Meus Pacientes') {
            await fetchPatients(userId, token);
        } else {
            setIsLoading(false);
        }

      } catch (err: any) {
        console.error("Erro na inicialização:", err);
        if (err.name === 'InvalidTokenError') {
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            setError('Falha ao carregar informações.');
            setIsLoading(false);
        }
      }
    };

    initializePage();
  }, [navigate, activeItem]);

  const fetchPatients = async (terapeutaId: number, token: string) => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await axios.get<Patient[]>(`${apiUrl}/api/pacientes/porTerapeuta/${terapeutaId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setPatients(response.data);
    } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        setError("Não foi possível carregar a lista de pacientes.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Handler para abrir o modal de perfil (NOVO)
  const handleViewProfile = (patientId: number) => {
      setViewProfileId(patientId);
      setIsProfileModalOpen(true);
  };

  const renderContent = () => {
    switch (activeItem) {
        case 'Meus Pacientes':
            return (
                <div className={styles.contentContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.cardTitle}>Gerenciamento de Pacientes</h2>
                        <p className={styles.subtitle}>Acompanhe e gerencie seus pacientes vinculados.</p>
                    </div>
                    
                    {isLoading && (
                        <div className={styles.loadingState}>
                            <Loader2 size={48} className={styles.spinner} />
                            <p>Carregando pacientes...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className={styles.errorState}>
                            <AlertCircle size={48} />
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div className={styles.cardsGrid}>
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <div key={patient.idpaciente} className={styles.patientCard}>
                                        <div className={styles.patientAvatar}>
                                            <User size={32} color="#fff" />
                                        </div>
                                        <div className={styles.patientInfo}>
                                            <h3 className={styles.patientName}>{patient.nome}</h3>
                                            <p className={styles.patientEmail}>{patient.email}</p>
                                            <p className={styles.patientPhone}>{patient.telefone || 'Sem telefone'}</p>
                                        </div>
                                        {/* Botão conectado ao Modal */}
                                        <button 
                                            className={styles.viewProfileButton}
                                            onClick={() => handleViewProfile(patient.idpaciente)}
                                        >
                                            Ver Perfil
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Você ainda não possui pacientes vinculados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        
        case 'Dashboard Geral':
            return <DashboardPageTherapist/>;
        
        case 'Meu Perfil':
            return <ProfilePage userId={userData?.id || null} userRole='terapeuta' />;
            
        default:
            return null;
    }
  };

  return (
    <div className={styles.container}>
      <aside 
        className={`${styles.sidebar} ${isSidebarExpanded ? styles.sidebarExpanded : ''}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={styles.sidebarHeader}>
          <img 
            src={logoImage} 
            alt="Logo Tear" 
            className={styles.logoImage} 
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/7C3AED/ffffff?text=T'; }}
          />
        </div>
        
        <nav className={styles.navigation}>
            {therapistNavigation.map((item) => (
                <button 
                    key={item.name}
                    className={`${styles.navItem} ${activeItem === item.name ? styles.navItemActive : ''}`}
                    onClick={() => setActiveItem(item.name)}
                >
                    <item.icon size={24} className={styles.navIcon} />
                    <span className={styles.navText}>{item.name}</span>
                </button>
            ))}
        </nav>

        <button className={`${styles.navItem} ${styles.logoutButton}`} onClick={handleLogout} title="Sair">
          <LogOut size={24} className={styles.navIcon} />
          <span className={styles.navText}>Sair</span>
        </button>
      </aside>

      <main className={`${styles.mainContent} ${isSidebarExpanded ? styles.mainContentShifted : ''}`}>
        <div className={styles.contentArea}>
            {renderContent()}
        </div>
      </main>

      <PatientProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        patientId={viewProfileId}
      />
    </div>
  );
};