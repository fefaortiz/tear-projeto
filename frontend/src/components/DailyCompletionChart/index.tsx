import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import styles from './style.module.css';

const DailyCompletionChart = () => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // Mock: Gera uma porcentagem aleatória entre 0 e 100
    setPercentage(Math.floor(Math.random() * 100));
  }, []);

  // Dados para o gráfico: Parte completa vs Parte restante
  const data = [
    { name: 'Completo', value: percentage },
    { name: 'Restante', value: 100 - percentage },
  ];

  const COLORS = ['#10b981', '#f3f4f6']; // Verde (sucesso) e Cinza claro

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Status Diário</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
              <Label
                value={`${percentage}%`}
                position="center"
                className={styles.percentageLabel}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.subtitle}>das características avaliadas hoje.</p>
    </div>
  );
};

export default DailyCompletionChart;