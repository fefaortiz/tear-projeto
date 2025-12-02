import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, BarChart2 } from 'lucide-react'; 
import WeeklyTrackingChart from '../../components/weeklyTrackingChart';
import TraitFrequencyChart from '../../components/TraitFrequencyChart';
import DailyCompletionChart from '../../components/DailyCompletionChart'; 
import AverageIntensityCard from '../../components/AverageIntensityCard'; 
import styles from './style.module.css';

interface Trait {
  idtraits: number;
  nome: string;
}

const DashboardPagePatient = () => {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [selectedTraitId, setSelectedTraitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const chartColor = "#7C3AED"; 

  useEffect(() => {
    const fetchTraits = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await axios.get(`${apiUrl}/api/traits/getAll`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setTraits(response.data);
        
        if (response.data.length > 0) {
            setSelectedTraitId(response.data[0].idtraits);
        }
      } catch (error) {
        console.error("Erro ao buscar traits", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTraits();
  }, []);

  const handleTraitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTraitId(Number(e.target.value));
  };

  const selectedTraitName = traits.find(t => t.idtraits === selectedTraitId)?.nome || '';

  if (loading) return <div className={styles.loading}>Carregando dashboard...</div>;

  return (
    <div className={styles.dashboardContainer}>
      
      <header className={styles.header}>
        <div className={styles.headerText}>
            <h1>Dashboard</h1>
            <p>Resumo do seu bem-estar.</p>
        </div>

        <div className={styles.filterContainer}>
            {traits.length > 0 ? (
                <div className={styles.selectWrapper}>
                    <select 
                        id="traitSelect"
                        className={styles.traitSelect}
                        value={selectedTraitId || ''}
                        onChange={handleTraitChange}
                    >
                        {traits.map((trait) => (
                            <option key={trait.idtraits} value={trait.idtraits}>
                                {trait.nome}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <p className={styles.noTraitsMsg}>Sem características.</p>
            )}
        </div>
      </header>

      <section className={styles.summarySection}>
        <div className={styles.summaryCard}>
            <DailyCompletionChart 
              role='paciente'
            />
        </div>
        <div className={styles.summaryCard}>
            <AverageIntensityCard 
            role='paciente'
          />
        </div>
      </section>

      <section className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>
            Análise Detalhada: <span className={styles.highlight}>{selectedTraitName}</span>
        </h2>

        {selectedTraitId && (
            <div className={styles.chartsGrid}>
                {/* Gráfico 1: Evolução Semanal */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <Activity size={20} className={styles.chartIcon} />
                        <h3>Evolução Recente</h3>
                    </div>
                    {/* O container flexivel do gráfico será tratado no componente */}
                    <WeeklyTrackingChart 
                        traitId={selectedTraitId} 
                        traitName={selectedTraitName}
                        color={chartColor} 
                        role='paciente'
                    />
                </div>

                {/* Gráfico 2: Frequência */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <BarChart2 size={20} className={styles.chartIcon} />
                        <h3>Frequência de Intensidade</h3>
                    </div>
                    <TraitFrequencyChart 
                        traitId={selectedTraitId}
                        traitName={selectedTraitName}
                        color={chartColor} 
                        role='paciente'
                    />
                </div>
            </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPagePatient;