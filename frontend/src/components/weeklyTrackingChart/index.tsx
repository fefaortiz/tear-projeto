import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Interface ajustada para refletir os dados da API e o campo formatado
interface TrackingData {
  dia_de_registro: string;
  intensidade: number;
  dataFormatada?: string;
}

interface WeeklyTrackingChartProps {
  traitId: number;
  traitName: string;
  color?: string;
  role: string;
  patientId?: number;
}

const WeeklyTrackingChart = ({ traitId, traitName, color = "#8884d8", role, patientId }: WeeklyTrackingChartProps) => {
  const [data, setData] = useState<TrackingData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        let response;

        if (role === 'terapeuta') {
          response = await axios.get(`${apiUrl}/api/patient-data/therapist-weekly-history/${traitId}/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          response = await axios.get(`${apiUrl}/api/patient-data/weekly-history/${traitId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        // Formata a data para DD/MM para exibir no eixo X
        // Garantimos que 'response.data' seja tratado como array
        const responseData = Array.isArray(response.data) ? response.data : [];
        
        const formattedData: TrackingData[] = responseData.map((item: any) => {
            // Cria data ajustando o timezone se necessário, ou usa string direta
            const dateObj = new Date(item.dia_de_registro);
            // Ajuste simples para exibir dia/mês
            const dia = dateObj.getUTCDate().toString().padStart(2, '0');
            const mes = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
            
            return {
                ...item,
                intensidade: Number(item.intensidade), // Garante que seja número
                dataFormatada: `${dia}/${mes}`
            };
        });

        // Ordena por data (caso a API não garanta a ordem)
        formattedData.sort((a, b) => new Date(a.dia_de_registro).getTime() - new Date(b.dia_de_registro).getTime());

        setData(formattedData);
      } catch (error) {
        console.error(`Erro ao carregar gráfico semanal para ${traitName}`, error);
      }
    };

    if (traitId) fetchData();
  }, [traitId, traitName]);

  // Container responsivo que ocupa 100% do pai (evita overflow)
  return (
    <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis 
                dataKey="dataFormatada" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
                interval="preserveStartEnd" // Tenta mostrar o primeiro e último
            />
            <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
            />
            <Line 
                type="monotone" 
                dataKey="intensidade" 
                stroke={color} 
                strokeWidth={3}
                dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '0.9rem' }}>
          Sem dados para esta semana.
        </div>
      )}
    </div>
  );
};

export default WeeklyTrackingChart;