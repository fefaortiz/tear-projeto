import { useEffect, useState } from 'react';
import axios from 'axios';
import WeeklyTrackingChart from '../weeklyTackingChart';
import TraitFrequencyChart from '../TraitFrequencyChart';
import DailyCompletionChart from '../DailyCompletionChart';
import AverageIntensityCard from '../AverageIntensityCard';
import styles from './style.module.css';

interface Trait {
  idtraits: number; // Atenção: Verifique se no seu banco é 'id' ou 'idtraits'
  descricao: string; // ou 'nome'
}

const DashboardPagePatient = () => {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);

  // Cores para alternar nos gráficos
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  useEffect(() => {
    const fetchTraits = async () => {
      try {
        const token = localStorage.getItem('token');
        // Rota para buscar as traits do usuário
        const response = await axios.get('http://localhost:3333/api/traits', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTraits(response.data);
      } catch (error) {
        console.error("Erro ao buscar traits", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTraits();
  }, []);

  if (loading) return <div className={styles.loading}>Carregando dashboard...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Dashboard do Paciente</h1>
        <p>Resumo do seu bem-estar e monitoramento.</p>
      </header>

      {/* SEÇÃO 1: Resumo Rápido */}
      <section className={styles.summarySection}>
        <div className={styles.summaryCard}>
            <DailyCompletionChart />
        </div>
        <div className={styles.summaryCard}>
            <AverageIntensityCard />
        </div>
      </section>

      {/* SEÇÃO 2: Evolução Semanal */}
      <section>
        <h2 className={styles.sectionTitle}>Evolução Semanal</h2>
        <div className={styles.gridContainer}>
          {traits.map((trait, index) => (
            <WeeklyTrackingChart 
              key={trait.idtraits} 
              traitId={trait.idtraits} 
              traitName={trait.descricao}
              color={colors[index % colors.length]} 
            />
          ))}
          {traits.length === 0 && <p>Nenhuma característica cadastrada.</p>}
        </div>
      </section>

      {/* SEÇÃO 3: Frequência */}
      <section>
        <h2 className={styles.sectionTitle}>Frequência por Intensidade (Total)</h2>
        <div className={styles.gridContainer}>
          {traits.map((trait, index) => (
            <TraitFrequencyChart 
              key={trait.idtraits}
              traitId={trait.idtraits} // Passando o ID real
              traitName={trait.descricao}
              color={colors[index % colors.length]}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPagePatient;