import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, Activity, Bell } from 'lucide-react';
import styles from './style.module.css'; // Importa o CSS Module
// Importa a imagem do logo conforme o caminho fornecido
import logoImage from '../../assets/logo_preenchido.png'; 

// Dados de navegação para o Paciente
const patientNavigation = [
    { name: 'Dashboard', href: '#dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', href: '#profile', icon: User },
    { name: 'Tracking Diário', href: '#tracking', icon: Activity },
    { name: 'Notificações', href: '#notifications', icon: Bell },
];

export function HomePagePatient() {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('Dashboard');
    // Estado para controlar o hover e a expansão da sidebar
    const [isSidebarHovered, setIsSidebarHovered] = useState(false); 

    // Função de Logout
    const handleLogout = () => {
        // Remove o token do localStorage
        localStorage.removeItem('token');
        // Redireciona para a página de login
        navigate('/login');
    };

    // Função para renderizar o conteúdo com base no item ativo
    const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard':
                return (
                    <>
                        <h2 className={styles.cardTitle}>Painel de Acompanhamento</h2>
                        <p>Visão geral do seu progresso, próximas consultas e tarefas pendentes.</p>
                    </>
                );
            case 'Meu Perfil':
                return (
                    <>
                        <h2 className={styles.cardTitle}>Configurações de Perfil</h2>
                        <p>Aqui você poderá visualizar e editar seus dados pessoais.</p>
                    </>
                );
            case 'Tracking Diário':
                return (
                    <>
                        <h2 className={styles.cardTitle}>Registro Diário</h2>
                        <p>Formulário para registrar seus sentimentos, atividades e eventos do dia.</p>
                    </>
                );
            case 'Notificações':
                return (
                    <>
                        <h2 className={styles.cardTitle}>Alertas e Mensagens</h2>
                        <p>Lista de notificações importantes do seu terapeuta ou cuidador.</p>
                    </>
                );
            default:
                return <p>Selecione um item no menu lateral.</p>;
        }
    };

    return (
        <div className={styles.container}>
            {/* ------------------ BARRA LATERAL (SIDEBAR) ------------------ */}
            <aside 
                // Aplica a classe de expansão condicionalmente
                className={`${styles.sidebar} ${isSidebarHovered ? styles.sidebarExpanded : ''}`} 
                // Adiciona listeners para controlar o estado de hover/expansão
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
            >
                <div className={styles.sidebarHeader}>
                    {/* LOGO DO PROJETO */}
                    <img 
                        src={logoImage}
                        alt="Logo Tear"
                        className={styles.logoImage}
                        // Fallback para placeholder em caso de erro no carregamento da imagem
                        onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            // Placeholder simples 'T' na cor primária
                            (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/4f46e5/ffffff?text=T';
                        }}
                    />
                </div>

                <nav className={styles.navigation}>
                    {patientNavigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault(); // Evita a navegação de âncora padrão
                                setActiveItem(item.name);
                            }}
                            className={`${styles.navItem} ${activeItem === item.name ? styles.navItemActive : ''}`}
                            title={item.name}
                        >
                            {/* Ícone é passado como componente React (Item.icon) */}
                            <item.icon size={24} className={styles.navIcon} /> 
                            <span className={styles.navText}>{item.name}</span>
                        </a>
                    ))}
                </nav>

                {/* Botão de Logout Fixo na parte inferior */}
                <button
                    onClick={handleLogout}
                    className={`${styles.navItem} ${styles.logoutButton}`}
                    title="Sair"
                >
                    <LogOut size={24} className={styles.navIcon} />
                    <span className={styles.navText}>Sair</span>
                </button>
            </aside>

            {/* ------------------ CONTEÚDO PRINCIPAL ------------------ */}
            <main className={`${styles.mainContent} ${isSidebarHovered ? styles.mainContentShifted : ''}`}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        Bem-vindo(a), Paciente!
                    </h1>
                    <p className={styles.subtitle}>Sua área de acompanhamento diário.</p>
                </div>

                <div className={styles.contentArea}>
                    <div className={styles.card}>
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}