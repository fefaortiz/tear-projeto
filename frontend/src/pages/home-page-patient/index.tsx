import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Loader2, AlertCircle, Activity, LayoutDashboard, User } from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; 
import logoImage from '../../assets/logo_preenchido.png';
import styles from './style.module.css';

// Importação dos Componentes
import { TraitCard } from '../../components/traitCard';
import { TrackMoodModal } from '../../components/modal-trackmood';
import { CreateTraitModal } from '../../components/modal-createtrait';
import { ProfilePage } from '../../components/profile-page';
import DashboardPagePatient from '../../components/dashboard-page-patient';

// Interface do Token Decodificado
interface DecodedTokenPayload {
    id: number;
    role: string;
    email: string;
    [key: string]: unknown;
}

// Interface para os dados do usuário
interface UserData {
  id: number;
  nome: string;
  email: string;
  role: 'paciente';
}

// Interface para as Traits
interface DailyTrackingItem {
    idtraits: number;
    nome: string;
    nota: number | string;
    atualizadoHoje: boolean;
    criador: string | null;
    criadorRole: 'Paciente' | 'Cuidador' | null;
}

const patientNavigation = [
    { name: 'Tracking Diário', href: '#tracking', icon: Activity },
    { name: 'Dashboard', href: '#dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '#profile', icon: User },
];

export const HomePagePatient = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Tracking Diário');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Estados de Dados
  const [userData, setUserData] = useState<UserData | null>(null);
  const [trackingData, setTrackingData] = useState<DailyTrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os Modais
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedTraitId, setSelectedTraitId] = useState<number | null>(null);
  const [selectedTraitName, setSelectedTraitName] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 1. Efeito Principal: Autenticação e Carga Inicial
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
        const userId = decoded.id;
        
        setUserData({
            id: userId,
            nome: 'Paciente', 
            email: decoded.email,
            role: 'paciente'
        });

        // Carrega tracking APENAS se estiver na aba de tracking
        if (activeItem === 'Tracking Diário') {
            await fetchTrackingData(userId, token);
        } else {
            // Se estiver em outra aba (ex: Perfil), remove o loading geral
            setIsLoading(false); 
        }

      } catch (err: any) {
        console.error("Erro na inicialização:", err);
        if (err.name === 'InvalidTokenError') {
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            setError('Falha ao carregar informações. Tente recarregar a página.');
            setIsLoading(false);
        }
      } 
    };

    initializePage();
  }, [navigate, activeItem]);

  const fetchTrackingData = async (userId: number, token: string) => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await axios.get<DailyTrackingItem[]>(
            `${apiUrl}/api/traits/daily-tracking/${userId}`, 
            { headers: { Authorization: `Bearer ${token}` }}
        );
        setTrackingData(response.data);
    } catch (err) {
        console.error("Erro ao buscar traits:", err);
        throw err;
    } finally {
        setIsLoading(false); // Garante que o loading pare
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- Handlers dos Modais e Ações ---

  const handleOpenTrackModal = (id: number, nome: string) => {
    setSelectedTraitId(id);
    setSelectedTraitName(nome);
    setIsTrackModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteTrait = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta característica? Todo o histórico associado será perdido.")) {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
            
            await axios.delete(`${apiUrl}/api/traits/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (userData?.id) {
                await fetchTrackingData(userData.id, token!);
            }
        } catch (err) {
            console.error("Erro ao deletar trait:", err);
            alert("Ocorreu um erro ao tentar excluir a característica.");
            setIsLoading(false);
        }
    }
  };

  const handleSuccessOperation = async () => {
    if (userData?.id) {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoading(true);
            try {
                await fetchTrackingData(userData.id, token);
            } catch (err) {
                console.error("Erro ao atualizar lista:", err);
                setIsLoading(false);
            }
        }
    }
  };

  const renderContent = () => {
    switch (activeItem) {
        case 'Tracking Diário':
            return (
                <div className={styles.trackingContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.cardTitle}>Monitoramento Diário</h2>
                        <p className={styles.subtitle}>Acompanhe suas características e registre seu progresso.</p>
                    </div>
                    
                    {isLoading && (
                        <div className={styles.loadingState}>
                            <Loader2 size={48} className={styles.spinner} />
                            <p>Carregando suas informações...</p>
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
                            <div 
                                className={styles.addCard} 
                                onClick={handleOpenCreateModal} 
                                role="button" 
                                aria-label="Adicionar nova característica"
                                title="Criar nova Trait"
                            >
                                <div className={styles.addButton}>
                                    <Plus size={40} color="#fff" strokeWidth={3} />
                                </div>
                                <span className={styles.addCardText}>Nova Trait</span> 
                            </div>

                            {trackingData.map((item) => (
                                <TraitCard
                                    key={item.idtraits}
                                    idtraits={item.idtraits}
                                    nome={item.nome}
                                    nota={item.nota}
                                    atualizadoHoje={item.atualizadoHoje}
                                    criador={item.criador}
                                    criadorRole={item.criadorRole}
                                    onRegisterClick={handleOpenTrackModal}
                                    onDeleteClick={handleDeleteTrait}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && trackingData.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>Você ainda não tem características cadastradas.</p>
                            <p>Clique no card com "+" para começar a monitorar suas traits!</p>
                        </div>
                    )}
                </div>
            );
        
        case 'Dashboard':
            return <div className={styles.card}><DashboardPagePatient/></div>;
        
        case 'Meu Perfil':
            // Renderiza o novo componente ProfilePage
            return <ProfilePage userId={userData?.id || null} userRole='paciente' />;
            
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
            {patientNavigation.map((item) => (
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

      <TrackMoodModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        traitId={selectedTraitId}
        traitName={selectedTraitName}
        onSuccess={handleSuccessOperation}
      />

      <CreateTraitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={userData?.id || null}
        onSuccess={handleSuccessOperation}
      />
    </div>
  );
};