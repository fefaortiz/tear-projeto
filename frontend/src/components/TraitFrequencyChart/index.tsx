import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import styles from './style.module.css';

interface FrequencyData {
  intensidade: number; // 1 a 5
  frequencia: number;  // Quantas vezes ocorreu
}

interface TraitFrequencyChartProps {
  traitName: string;
  color?: string;
}

const TraitFrequencyChart = ({ traitName, color = "#8884d8" }: TraitFrequencyChartProps) => {
  const [data, setData] = useState<FrequencyData[]>([]);

  useEffect(() => {
    // Gera dados mockados: para cada nota (1-5), gera uma frequência aleatória
    const generateMockData = () => {
      const mockData: FrequencyData[] = [];
      for (let i = 1; i <= 5; i++) {
        mockData.push({
          intensidade: i,
          frequencia: Math.floor(Math.random() * 15) // 0 a 15 vezes
        });
      }
      return mockData;
    };
    setData(generateMockData());
  }, []);

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Histórico: {traitName}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="intensidade" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              allowDecimals={false} // Frequência é sempre inteira
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar 
                dataKey="frequencia" 
                fill={color} 
                radius={[4, 4, 0, 0]} // Arredonda o topo das barras
                barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TraitFrequencyChart;