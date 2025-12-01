import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import styles from './style.module.css';

interface TrackingData {
  dia_de_registro: string;
  intensidade: number;
  dataFormatada?: string;
}

interface WeeklyTrackingChartProps {
  traitId: number;
  traitName: string;
  color?: string;
}

const WeeklyTrackingChart = ({ traitId, traitName, color = "#8884d8" }: WeeklyTrackingChartProps) => {
  const [data, setData] = useState<TrackingData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3333/api/dataviz/weekly-history/${traitId}`, {
             headers: { Authorization: `Bearer ${token}` }
        });

        // Formata a data para DD/MM para exibir no eixo X
        const formattedData = response.data.map((item: any) => ({
            ...item,
            dataFormatada: new Date(item.dia_de_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }));

        setData(formattedData);
      } catch (error) {
        console.error(`Erro ao carregar gráfico semanal para ${traitName}`, error);
      }
    };

    if (traitId) fetchData();
  }, [traitId, traitName]);

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>{traitName} - Últimos 7 Dias</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
            <XAxis dataKey="dataFormatada" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" tickLine={false} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="intensidade" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyTrackingChart;