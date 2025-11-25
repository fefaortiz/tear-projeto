import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, LogOut, User, Activity, Bell, Loader2 } from 'lucide-react';
import styles from './style.module.css';
import logoImage from '../../assets/logo_preenchido.png';

// Importação dos Componentes
import { TraitCard } from '../../components/traitCard';
import { TrackMood } from '../../components/trackmood';

interface DecodedTokenPayload {
    id: number;
    role: string;
    [key: string]: unknown;
}

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
    { name: 'Notificações', href: '#notifications', icon: Bell },
];

export function HomePagePatient() {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('Tracking Diário');
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    
    // Estados de Dados da API
    const [trackingData, setTrackingData] = useState<DailyTrackingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    // --- ESTADOS DO MODAL TRACKMOOD ---
    const [isTrackMoodOpen, setIsTrackMoodOpen] = useState(false);
    const [selectedTraitId, setSelectedTraitId] = useState<number | null>(null);
    const [selectedTraitName, setSelectedTraitName] = useState<string | null>(null);

    // 1. Obter ID do usuário (Auth)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode<DecodedTokenPayload>(token);
            setUserId(decoded.id);
        } catch {
            navigate('/login');
        }
    }, [navigate]);

    // 2. Função para buscar dados (Memoizada para ser usada no reload)
    const fetchDailyTracking = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
            const token = localStorage.getItem('token');

            const response = await axios.get<DailyTrackingItem[]>(
                `${apiUrl}/api/traits/daily-tracking/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTrackingData(response.data);
        } catch (err) {
            console.error(err);
            setError("Não foi possível carregar seus dados.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // 3. Carregar dados iniciais
    useEffect(() => {
        if (activeItem === 'Tracking Diário') {
            fetchDailyTracking();
        }
    }, [fetchDailyTracking, activeItem]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- LÓGICA DE ABERTURA DO MODAL ---
    // Esta função é passada para o TraitCard
    const handleRegisterClick = (idTrait: number, nomeTrait: string) => {
        setSelectedTraitId(idTrait);
        setSelectedTraitName(nomeTrait);
        setIsTrackMoodOpen(true); // Abre o modal
    };

    // --- CALLBACK DE SUCESSO ---
    // Esta função é passada para o TrackMood
    const handleTrackingSuccess = () => {
        // Atualiza a lista para refletir que o card agora está "Atualizado"
        fetchDailyTracking();
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'Tracking Diário':
                return (
                    <div className={styles.trackingContainer}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.cardTitle}>Registro Diário</h2>
                            <p className={styles.subtitle}>Registre como está a intensidade de cada característica hoje.</p>
                        </div>

                        {isLoading && (
                            <div className={styles.loadingState}>
                                <Loader2 className={styles.spinner} size={32} />
                                <p>Carregando...</p>
                            </div>
                        )}

                        {!isLoading && error && (
                            <div className={styles.errorState}><p>{error}</p></div>
                        )}

                        {!isLoading && !error && trackingData.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>Nenhuma característica encontrada. Solicite ao seu terapeuta ou cuidador o cadastro de traits.</p>
                            </div>
                        )}

                        <div className={styles.cardsGrid}>
                            {trackingData.map((item) => (
                                <TraitCard 
                                    key={item.idtraits}
                                    {...item}
                                    // Conecta o evento do card à função que abre o modal
                                    onRegisterClick={handleRegisterClick}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 'Dashboard':
                return <div className={styles.card}><h2 className={styles.cardTitle}>Dashboard (Em breve)</h2></div>;
            case 'Meu Perfil':
                return <div className={styles.card}><h2 className={styles.cardTitle}>Perfil (Em breve)</h2></div>;
            case 'Notificações':
                return <div className={styles.card}><h2 className={styles.cardTitle}>Notificações (Em breve)</h2></div>;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <aside 
                className={`${styles.sidebar} ${isSidebarHovered ? styles.sidebarExpanded : ''}`} 
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
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
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => { e.preventDefault(); setActiveItem(item.name); }}
                            className={`${styles.navItem} ${activeItem === item.name ? styles.navItemActive : ''}`}
                        >
                            <item.icon size={24} className={styles.navIcon} /> 
                            <span className={styles.navText}>{item.name}</span>
                        </a>
                    ))}
                </nav>
                <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>
                    <LogOut size={24} className={styles.navIcon} />
                    <span className={styles.navText}>Sair</span>
                </button>
            </aside>

            <main className={`${styles.mainContent} ${isSidebarHovered ? styles.mainContentShifted : ''}`}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Bem-vindo(a), Paciente!</h1>
                </div>
                <div className={styles.contentArea}>
                    {renderContent()}
                </div>
            </main>

            {/* O Modal é renderizado aqui, flutuando sobre a página quando isOpen=true */}
            <TrackMood 
                isOpen={isTrackMoodOpen}
                onClose={() => setIsTrackMoodOpen(false)}
                traitId={selectedTraitId}
                traitName={selectedTraitName}
                onSuccess={handleTrackingSuccess}
            />
        </div>
    );
}