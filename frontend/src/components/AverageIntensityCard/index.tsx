import { useState, useEffect } from 'react';
import styles from './style.module.css';
import { Activity } from 'lucide-react'; // Ícone opcional

const AverageIntensityCard = () => {
  const [average, setAverage] = useState<string>("0.0");

  useEffect(() => {
    // Mock: Média entre 1.0 e 5.0
    const randomAvg = (Math.random() * (5 - 1) + 1).toFixed(1);
    setAverage(randomAvg);
  }, []);

  // Define cor baseada na intensidade (apenas visual)
  const getStatusColor = (val: number) => {
    if (val < 2.5) return styles.low;     // Verde/Calmo
    if (val < 4.0) return styles.medium;  // Amarelo/Atenção
    return styles.high;                   // Vermelho/Alto
  };

  return (
    <div className={`${styles.cardContainer} ${getStatusColor(Number(average))}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Média Geral</h3>
        <Activity size={20} className={styles.icon} />
      </div>
      
      <div className={styles.content}>
        <span className={styles.number}>{average}</span>
        <span className={styles.label}>Nos últimos 7 dias</span>
      </div>
    </div>
  );
};

export default AverageIntensityCard;