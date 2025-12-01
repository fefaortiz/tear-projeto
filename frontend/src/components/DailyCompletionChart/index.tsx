import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import styles from './style.module.css';

const DailyCompletionChart = () => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3333/api/dataviz/daily-completion', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPercentage(response.data.percentage);
        } catch (error) {
            console.error("Erro daily stats", error);
        }
    };
    fetchData();
  }, []);

  const data = [
    { name: 'Completo', value: percentage },
    { name: 'Restante', value: 100 - percentage },
  ];

  const COLORS = ['#10b981', '#f3f4f6'];

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Status Diário</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
              <Label value={`${percentage}%`} position="center" className={styles.percentageLabel} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.subtitle}>das características avaliadas hoje.</p>
    </div>
  );
};

export default DailyCompletionChart;