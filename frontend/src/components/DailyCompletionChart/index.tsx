import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import styles from './style.module.css';

interface DailyCompletionChartProps {
  role: string;
  patientId?: number;
}

const DailyCompletionChart = ({ role, patientId }: DailyCompletionChartProps) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';

            let response;

            if (role === 'terapeuta') {
              response = await axios.get(`${apiUrl}/api/patient-data/therapist-daily-completion/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              response = await axios.get(`${apiUrl}/api/patient-data/daily-completion`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
            
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