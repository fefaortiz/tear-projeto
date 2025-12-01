import WeeklyTrackingChart from '../weeklyTackingChart';
import TraitFrequencyChart from '../TraitFrequencyChart'; // Novo
import DailyCompletionChart from '../DailyCompletionChart'; // Novo
import AverageIntensityCard from '../AverageIntensityCard'; // Novo
import styles from './style.module.css';

const DashboardPagePatient = () => {
  
  // Dados mockados de traits
  const mockTraits = [
    { id: 1, nome: 'Ansiedade Social' },
    { id: 2, nome: 'Foco nas Tarefas' },
    { id: 3, nome: 'Qualidade do Sono' },
    { id: 4, nome: 'Irritabilidade' }
  ];

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Dashboard do Paciente</h1>
        <p>Resumo do seu bem-estar e monitoramento.</p>
      </header>

      {/* SEÇÃO 1: Resumo Rápido (Rosca e Média) */}
      <section className={styles.summarySection}>
        <div className={styles.summaryCard}>
            <DailyCompletionChart />
        </div>
        <div className={styles.summaryCard}>
            <AverageIntensityCard />
        </div>
      </section>

      {/* SEÇÃO 2: Gráficos de Linha (Evolução Semanal) */}
      <section>
        <h2 className={styles.sectionTitle}>Evolução Semanal</h2>
        <div className={styles.gridContainer}>
          {mockTraits.map((trait, index) => (
            <WeeklyTrackingChart 
              key={trait.id} 
              traitId={trait.id} 
              traitName={trait.nome}
              color={colors[index % colors.length]} 
            />
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: Gráficos de Barra (Frequência Acumulada) */}
      <section>
        <h2 className={styles.sectionTitle}>Frequência por Intensidade (Total)</h2>
        <div className={styles.gridContainer}>
          {mockTraits.map((trait, index) => (
            <TraitFrequencyChart 
              key={trait.id}
              traitName={trait.nome}
              color={colors[index % colors.length]}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPagePatient;