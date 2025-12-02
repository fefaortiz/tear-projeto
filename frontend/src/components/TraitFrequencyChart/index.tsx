import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface FrequencyData {
  intensidade: number;
  frequencia: number;
}

interface TraitFrequencyChartProps {
  traitId: number;
  traitName: string;
  color?: string;
  role: string;
  patientId?: number;
}

const TraitFrequencyChart = ({ traitId, color = "#8884d8", role, patientId }: TraitFrequencyChartProps) => {
  const [data, setData] = useState<FrequencyData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        let response;

        if (role === 'terapeuta') {
          response = await axios.get(`${apiUrl}/api/patient-data/therapist-frequency/${traitId}/${patientId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          response = await axios.get(`${apiUrl}/api/patient-data/frequency/${traitId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
        }

        setData(response.data);
      } catch (error) {
        console.error("Erro frequência", error);
      }
    };
    if (traitId) fetchData();
  }, [traitId]);

  return (
    <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis 
              dataKey="intensidade" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
          />
          <YAxis 
              allowDecimals={false} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
          />
          <Tooltip 
              cursor={{ fill: '#f9fafb' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
          />
          <Bar dataKey="frequencia" fill={color} radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TraitFrequencyChart;