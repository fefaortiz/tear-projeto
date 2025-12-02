import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, BarChart2, Users, FileText } from 'lucide-react'; 
import { jwtDecode } from 'jwt-decode';

// Componentes Gráficos Reutilizados
import WeeklyTrackingChart from '../../components/weeklyTrackingChart';
import TraitFrequencyChart from '../../components/TraitFrequencyChart';
import DailyCompletionChart from '../../components/DailyCompletionChart'; 
import AverageIntensityCard from '../../components/AverageIntensityCard'; 

import styles from './style.module.css';

// Interfaces
interface DecodedTokenPayload {
    id: number;
    role: string;
    [key: string]: any;
}

interface Patient {
  idpaciente: number;
  nome: string;
}

interface Trait {
  idtraits: number;
  nome: string;
}

const DashboardPageTherapist = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  
  const [traits, setTraits] = useState<Trait[]>([]);
  const [selectedTraitId, setSelectedTraitId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingTraits, setLoadingTraits] = useState(false);

  // Cor do Tema do Terapeuta (Teal)
  const chartColor = "#0d9488"; 

  // 1. Busca a lista de Pacientes ao carregar
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode<DecodedTokenPayload>(token);
        const therapistId = decoded.id;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        // Rota para buscar pacientes do terapeuta
        const response = await axios.get<Patient[]>(
            `${apiUrl}/api/pacientes/porTerapeuta/${therapistId}`, 
            { 
              headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        setPatients(response.data);
        
        // Seleciona o primeiro paciente automaticamente se houver
        if (response.data.length > 0) {
            setSelectedPatientId(response.data[0].idpaciente);
        }
      } catch (error) {
        console.error("Erro ao buscar pacientes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // 2. Busca as Traits quando o Paciente selecionado muda
  useEffect(() => {
    const fetchTraits = async () => {
      if (!selectedPatientId) {
          setTraits([]);
          setSelectedTraitId(null);
          return;
      }

      setLoadingTraits(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        // Usamos a rota de tracking diário ou summary para pegar a lista de traits do paciente
        const response = await axios.get(
            `${apiUrl}/api/traits/daily-tracking/${selectedPatientId}`, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setTraits(response.data);
        
        // Seleciona a primeira trait automaticamente
        if (response.data.length > 0) {
            setSelectedTraitId(response.data[0].idtraits);
        } else {
            setSelectedTraitId(null);
        }
      } catch (error) {
        console.error("Erro ao buscar traits do paciente", error);
      } finally {
        setLoadingTraits(false);
      }
    };

    fetchTraits();
  }, [selectedPatientId]);

  // Handlers de Mudança
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(Number(e.target.value));
  };

  const handleTraitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTraitId(Number(e.target.value));
  };

  // Dados para exibição
  const selectedPatientName = patients.find(p => p.idpaciente === selectedPatientId)?.nome || 'Paciente';
  const selectedTraitName = traits.find(t => t.idtraits === selectedTraitId)?.nome || '';

  if (loading) return <div className={styles.loading}>Carregando painel do terapeuta...</div>;

  return (
    <div className={styles.dashboardContainer}>
      
      {/* HEADER: Título e Filtros */}
      <header className={styles.header}>
        <div className={styles.headerText}>
            <h1>Painel Clínico</h1>
            <p>Acompanhamento detalhado dos seus pacientes.</p>
        </div>

        {/* Container de Filtros (Dois Dropdowns) */}
        <div className={styles.filtersWrapper}>
            
            {/* 1. Seletor de Paciente */}
            <div className={styles.filterGroup}>
                <label htmlFor="patientSelect" className={styles.filterLabel}>
                    <Users size={16} /> Paciente:
                </label>
                <div className={styles.selectWrapper}>
                    <select 
                        id="patientSelect"
                        className={styles.select}
                        value={selectedPatientId || ''}
                        onChange={handlePatientChange}
                        disabled={patients.length === 0}
                    >
                        {patients.length === 0 && <option>Nenhum paciente vinculado</option>}
                        {patients.map((p) => (
                            <option key={p.idpaciente} value={p.idpaciente}>
                                {p.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. Seletor de Trait (Dependente do Paciente) */}
            <div className={styles.filterGroup}>
                <label htmlFor="traitSelect" className={styles.filterLabel}>
                    <FileText size={16} /> Característica:
                </label>
                <div className={styles.selectWrapper}>
                    <select 
                        id="traitSelect"
                        className={styles.select}
                        value={selectedTraitId || ''}
                        onChange={handleTraitChange}
                        disabled={!selectedPatientId || traits.length === 0 || loadingTraits}
                    >
                        {loadingTraits ? (
                            <option>Carregando...</option>
                        ) : traits.length === 0 ? (
                            <option>Nenhuma trait cadastrada</option>
                        ) : (
                            traits.map((t) => (
                                <option key={t.idtraits} value={t.idtraits}>
                                    {t.nome}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

        </div>
      </header>

      {/* SEÇÃO 1: Resumo Rápido (Cards) */}
      <section className={styles.summarySection}>
        <div className={styles.summaryCard}>
            <DailyCompletionChart 
              role='terapeuta'
              patientId={selectedPatientId!}
            />
        </div>
        <div className={styles.summaryCard}>
            <AverageIntensityCard 
              role='terapeuta'
              patientId={selectedPatientId!}
            />
        </div>
      </section>

      {/* SEÇÃO 2: Gráficos Detalhados */}
      <section className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>
            Análise: <span className={styles.highlight}>{selectedPatientName}</span> 
            <span className={styles.separator}>/</span> 
            <span className={styles.subHighlight}>{selectedTraitName}</span>
        </h2>

        {selectedTraitId ? (
            <div className={styles.chartsGrid}>
                {/* Gráfico 1: Evolução Semanal */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <Activity size={20} className={styles.chartIcon} />
                        <h3>Evolução Semanal</h3>
                    </div>
                    <WeeklyTrackingChart 
                        traitId={selectedTraitId} 
                        traitName={selectedTraitName}
                        color={chartColor} 
                        role={'terapeuta'}
                        patientId={selectedPatientId!}
                    />
                </div>

                {/* Gráfico 2: Frequência */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <BarChart2 size={20} className={styles.chartIcon} />
                        <h3>Frequência de Intensidades</h3>
                    </div>
                    <TraitFrequencyChart 
                        traitId={selectedTraitId}
                        traitName={selectedTraitName}
                        color={chartColor}
                        role={'terapeuta'}
                        patientId={selectedPatientId!}
                    />
                </div>
            </div>
        ) : (
            <div className={styles.emptyState}>
                <p>Selecione um paciente e uma característica para visualizar os dados.</p>
            </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPageTherapist;