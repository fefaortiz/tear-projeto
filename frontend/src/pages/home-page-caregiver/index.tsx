import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, User, Loader2, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import logoImage from '../../assets/logo_preenchido.png';
import styles from './style.module.css';

// Reutilizamos o componente de Perfil
import { ProfilePage } from '../../components/profile-page';

// Interface do Token
interface DecodedTokenPayload {
    id: number;
    role: string;
    email: string;
    [key: string]: unknown;
}

// Interface do Usuário (Cuidador)
interface UserData {
  id: number;
  nome: string;
  email: string;
  role: 'cuidador';
}

// Interface do Paciente (para a lista)
interface Patient {
  idpaciente: number;
  nome: string;
  email: string;
  telefone?: string;
  // Adicione outros campos que a rota retornar se necessário
}

const caregiverNavigation = [
    { name: 'Meus Pacientes', href: '#patients', icon: Users },
    { name: 'Dashboard Geral', href: '#dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '#profile', icon: User },
];

export const HomePageCaregiver = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Meus Pacientes');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Estados de Dados
  const [userData, setUserData] = useState<UserData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Verifica se é realmente um cuidador
        if (decoded.role !== 'cuidador') {
            setError('Acesso não autorizado para este perfil.');
            setIsLoading(false);
            return;
        }

        const userId = decoded.id;
        
        setUserData({
            id: userId,
            nome: 'Cuidador', // Idealmente viria de uma rota /me
            email: decoded.email,
            role: 'cuidador'
        });

        // Carrega pacientes se estiver na aba correta
        if (activeItem === 'Meus Pacientes') {
            await fetchPatients(userId, token);
        } else {
            setIsLoading(false);
        }

      } catch (err: unknown) {
        console.error("Erro na inicialização:", err);
        const error = err as Error;
        if (error.name === 'InvalidTokenError') {
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

  // Função para buscar pacientes do cuidador
  const fetchPatients = async (cuidadorId: number, token: string) => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await axios.get<Patient[]>(
            `${apiUrl}/api/pacientes/por-cuidador/${cuidadorId}`, 
            { 
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setPatients(response.data);
    } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        // Fallback silencioso ou erro customizado se a rota não existir ainda
        // setError("Não foi possível carregar a lista de pacientes.");
        setPatients([]); // Limpa lista em caso de erro para não quebrar a UI
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Renderização do Conteúdo
  const renderContent = () => {
    switch (activeItem) {
        case 'Meus Pacientes':
            return (
                <div className={styles.contentContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.cardTitle}>Pacientes sob Cuidados</h2>
                        <p className={styles.subtitle}>Gerencie as informações e acompanhamento dos seus pacientes.</p>
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
                                        <button className={styles.viewProfileButton}>
                                            Ver Dados
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
            return <div className={styles.card}><h2 className={styles.cardTitle}>Dashboard Geral (Em breve)</h2></div>;
        
        case 'Meu Perfil':
            // Renderiza o ProfilePage passando o role 'cuidador'
            return <ProfilePage userId={userData?.id || null} userRole="cuidador" />;
            
        default:
            return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
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
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/2563EB/ffffff?text=T'; }}
          />
        </div>
        
        <nav className={styles.navigation}>
            {caregiverNavigation.map((item) => (
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

      {/* Conteúdo Principal */}
      <main className={`${styles.mainContent} ${isSidebarExpanded ? styles.mainContentShifted : ''}`}>
        <div className={styles.contentArea}>
            {renderContent()}
        </div>
      </main>
    </div>
  );
};