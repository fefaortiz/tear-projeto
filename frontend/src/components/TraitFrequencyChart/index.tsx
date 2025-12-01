import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import styles from './style.module.css';

interface FrequencyData {
  intensidade: number;
  frequencia: number;
}

interface TraitFrequencyChartProps {
  traitId: number; // Adicionado prop ID
  traitName: string;
  color?: string;
}

const TraitFrequencyChart = ({ traitId, traitName, color = "#8884d8" }: TraitFrequencyChartProps) => {
  const [data, setData] = useState<FrequencyData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3333/api/dataviz/frequency/${traitId}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error("Erro frequência", error);
      }
    };
    if (traitId) fetchData();
  }, [traitId]);

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Histórico: {traitName}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="intensidade" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
            <Bar dataKey="frequencia" fill={color} radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TraitFrequencyChart;