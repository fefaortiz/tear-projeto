import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, User, Loader2, Activity, Plus } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import logoImage from '../../assets/logo_preenchido.png';
import styles from './style.module.css';

// Componentes
import { ProfilePage } from '../../components/profile-page';
import { TraitCard } from '../../components/traitCard'; 
import { TrackMoodModal } from '../../components/modal-trackmood'; 
import { CreateTraitModal } from '../../components/modal-createtrait'; 
import DashboardPageCaregiver from '../../components/dashboard-page-caregiver';

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
  role: 'cuidador';
}

interface Patient {
  idpaciente: number;
  nome: string;
  email: string;
  telefone?: string;
}

interface DailyTrackingItem {
    idtraits: number;
    nome: string;
    nota: number | string;
    atualizadoHoje: boolean;
    criador: string | null;
    criadorRole: 'Paciente' | 'Cuidador' | null;
}

const caregiverNavigation = [
    { name: 'Meus Pacientes', href: '#patients', icon: Users },
    { name: 'Dashboard Geral', href: '#dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '#profile', icon: User }
];

export const HomePageCaregiver = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Meus Pacientes');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Dados Gerais
  const [userData, setUserData] = useState<UserData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados de Traits (Gestão)
  const [selectedPatientForTraits, setSelectedPatientForTraits] = useState<number | null>(null);
  const [patientTraits, setPatientTraits] = useState<DailyTrackingItem[]>([]);
  const [loadingTraits, setLoadingTraits] = useState(false);

  // Modais
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedTraitId, setSelectedTraitId] = useState<number | null>(null);
  const [selectedTraitName, setSelectedTraitName] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 1. Inicialização
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
        if (decoded.role !== 'cuidador') {
            setError('Acesso não autorizado.');
            setIsLoading(false);
            return;
        }

        const userId = decoded.id;
        setUserData({ id: userId, nome: 'Cuidador', email: decoded.email, role: 'cuidador' });

        if (activeItem === 'Meus Pacientes') {
            await fetchPatients(userId, token);
        } else {
            setIsLoading(false);
        }

      } catch (err: any) {
        console.error("Erro auth:", err);
        navigate('/login');
      }
    };

    initializePage();
  }, [navigate, activeItem]);

  // Busca Pacientes
  const fetchPatients = async (cuidadorId: number, token: string) => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        // Rota para buscar pacientes do cuidador
        const response = await axios.get<Patient[]>(
            `${apiUrl}/api/pacientes/por-cuidador/${cuidadorId}`, 
            { 
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setPatients(response.data);
        
        // Seleciona o primeiro automaticamente se não houver seleção
        if (response.data.length > 0 && !selectedPatientForTraits) {
            setSelectedPatientForTraits(response.data[0].idpaciente);
        }
    } catch (err) {
        console.error("Erro buscar pacientes:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // Busca Traits do Paciente Selecionado
  const fetchPatientTraits = useCallback(async () => {
    if (!selectedPatientForTraits) return;
    
    setLoadingTraits(true);
    try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        const response = await axios.get<DailyTrackingItem[]>(
            `${apiUrl}/api/traits/daily-tracking/${selectedPatientForTraits}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatientTraits(response.data);
    } catch (err) {
        console.error("Erro ao buscar traits:", err);
    } finally {
        setLoadingTraits(false);
    }
  }, [selectedPatientForTraits]);

  useEffect(() => {
    if (selectedPatientForTraits) {
        fetchPatientTraits();
    }
  }, [selectedPatientForTraits, fetchPatientTraits]);

  // --- Handlers ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Ao clicar no card do paciente ou mudar o dropdown
  const handleSelectPatient = (id: number) => {
      setSelectedPatientForTraits(id);
  };

  // Abrir Modal de Tracking
  const handleOpenTrackModal = (id: number, nome: string) => {
    setSelectedTraitId(id);
    setSelectedTraitName(nome);
    setIsTrackModalOpen(true);
  };

  // Abrir Modal de Criação
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Deletar Trait
  const handleDeleteTrait = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta característica do paciente?")) {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
            await axios.delete(`${apiUrl}/api/traits/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatientTraits(); 
        } catch (err) {
            alert("Erro ao excluir trait.");
        }
    }
  };

  const handleOperationSuccess = () => {
    fetchPatientTraits();
  };

  // Renderização do Conteúdo
  const renderContent = () => {
    switch (activeItem) {
        case 'Meus Pacientes':
            return (
                <div className={styles.contentContainer}>
                    
                    {/* Topo: Lista de Pacientes (Resumo) */}
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.cardTitle}>Pacientes Vinculados</h2>
                    </div>
                    
                    {isLoading ? (
                        <div className={styles.loadingState}><Loader2 size={32} className={styles.spinner}/></div>
                    ) : patients.length > 0 ? (
                        <div className={styles.patientsGridSimple}>
                             {patients.map((patient) => (
                                <div 
                                    key={patient.idpaciente} 
                                    className={`${styles.patientCardSimple} ${selectedPatientForTraits === patient.idpaciente ? styles.patientCardActive : ''}`}
                                    onClick={() => handleSelectPatient(patient.idpaciente)}
                                >
                                    <div className={styles.patientAvatarSmall}><User size={20} color="#fff"/></div>
                                    <div className={styles.patientInfoSmall}>
                                        <span className={styles.patientNameSmall}>{patient.nome}</span>
                                        <span className={styles.patientEmailSmall}>{patient.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>Você não possui pacientes vinculados.</div>
                    )}

                    <hr className={styles.divider} />

                    {/* Parte Inferior: Traits do Paciente Selecionado */}
                    <div className={styles.traitsSection}>
                        <div className={styles.traitsHeaderRow}>
                            <div className={styles.traitsTitleGroup}>
                                <Activity size={20} className={styles.iconPrimary} />
                                <h3 className={styles.subTitle}>Gestão de Características</h3>
                            </div>
                            
                            {/* Dropdown de Seleção Redundante (Útil se a lista acima for longa) */}
                            <div className={styles.selectWrapper}>
                                <select 
                                    className={styles.select}
                                    value={selectedPatientForTraits || ''}
                                    onChange={(e) => handleSelectPatient(Number(e.target.value))}
                                    disabled={patients.length === 0}
                                >
                                    {patients.length === 0 && <option>Nenhum paciente</option>}
                                    {patients.map(p => (
                                        <option key={p.idpaciente} value={p.idpaciente}>{p.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedPatientForTraits ? (
                            loadingTraits ? (
                                <div className={styles.loadingState}><Loader2 size={32} className={styles.spinner}/><p>Carregando traits...</p></div>
                            ) : (
                                <div className={styles.cardsGrid}>
                                    
                                    {/* CARD DE ADICIONAR (Estilo Azul) */}
                                    <div 
                                        className={styles.addCard} 
                                        onClick={handleOpenCreateModal} 
                                        role="button"
                                        title="Criar nova trait"
                                    >
                                        <div className={styles.addButton}>
                                            <Plus size={32} color="#fff" strokeWidth={3} />
                                        </div>
                                        <span className={styles.addCardText}>Nova Trait</span> 
                                    </div>

                                    {/* Cards de Traits */}
                                    {patientTraits.map((trait) => (
                                        <TraitCard
                                            key={trait.idtraits}
                                            idtraits={trait.idtraits}
                                            nome={trait.nome}
                                            nota={trait.nota}
                                            atualizadoHoje={trait.atualizadoHoje}
                                            criador={trait.criador}
                                            criadorRole={trait.criadorRole}
                                            onRegisterClick={handleOpenTrackModal}
                                            onDeleteClick={handleDeleteTrait}
                                        />
                                    ))}
                                    
                                    {patientTraits.length === 0 && (
                                        <div className={styles.emptyTraitsMsg}>
                                            Nenhuma característica cadastrada para este paciente.
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className={styles.emptyState}>Selecione um paciente para gerenciar.</div>
                        )}
                    </div>
                </div>
            );
        
        case 'Dashboard Geral':
            return <DashboardPageCaregiver/>;
        case 'Meu Perfil':
            return <ProfilePage userId={userData?.id || null} userRole="cuidador" />;
        default: return null;
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

      <main className={`${styles.mainContent} ${isSidebarExpanded ? styles.mainContentShifted : ''}`}>
        <div className={styles.contentArea}>
            {renderContent()}
        </div>
      </main>

      {/* Modais */}
      <TrackMoodModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        traitId={selectedTraitId}
        traitName={selectedTraitName}
        onSuccess={handleOperationSuccess}
      />

      <CreateTraitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={selectedPatientForTraits} // Passa o ID do paciente selecionado para criar a trait para ele
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
};