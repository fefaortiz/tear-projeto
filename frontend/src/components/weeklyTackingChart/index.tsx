import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import styles from './style.module.css';

// Interface dos dados (simulando o banco)
interface TrackingData {
  dia_de_registro: string;
  dataFormatada: string;
  intensidade: number;
}

interface WeeklyTrackingChartProps {
  traitId: number; // Mantemos para compatibilidade futura
  traitName: string;
  color?: string;
}

const WeeklyTrackingChart = ({ traitName, color = "#8884d8" }: WeeklyTrackingChartProps) => {
  const [data, setData] = useState<TrackingData[]>([]);

  useEffect(() => {
    // Função para gerar dados falsos dos últimos 7 dias
    const generateMockData = () => {
      const mockData: TrackingData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i); // Subtrai dias para voltar no tempo

        mockData.push({
          dia_de_registro: d.toISOString().split('T')[0],
          // Formata para mostrar apenas Dia/Mês (ex: 01/12)
          dataFormatada: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          // Gera uma intensidade aleatória entre 1 e 5
          intensidade: Math.floor(Math.random() * 5) + 1, 
        });
      }
      return mockData;
    };

    setData(generateMockData());
  }, []);

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>{traitName} - Últimos 7 Dias</h3>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
            <XAxis 
              dataKey="dataFormatada" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#e5e7eb"
              tickLine={false}
            />
            <YAxis 
              domain={[0, 6]} // Um pouco de margem acima do 5
              ticks={[1, 2, 3, 4, 5]} // Força mostrar apenas inteiros
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
              cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Line 
              type="monotone" // Suaviza a linha (curva)
              dataKey="intensidade" 
              stroke={color} 
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 0 }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyTrackingChart;