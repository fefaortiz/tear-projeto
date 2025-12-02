import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css';
import { Activity } from 'lucide-react';

interface AverageIntensityCardProps {
  role: string;
  patientId?: number;
}

const AverageIntensityCard = ({ role, patientId }: AverageIntensityCardProps) => {
  const [average, setAverage] = useState<string>("0.0");

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';

            let response;

            if (role === 'terapeuta') {
              response = await axios.get(`${apiUrl}/api/patient-data/therapist-weekly-average/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              response = await axios.get(`${apiUrl}/api/patient-data/weekly-average`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
            setAverage(response.data.average);
        } catch (error) {
            console.error("Erro average stats", error);
        }
    };
    fetchData();
  }, [patientId]);

  const getStatusColor = (val: number) => {
    if (val < 2.5) return styles.low;
    if (val < 4.0) return styles.medium;
    return styles.high;
  };

  return (
    <div className={`${styles.cardContainer} ${getStatusColor(Number(average))}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Média Geral</h3>
        <Activity size={20} className={styles.icon} />
      </div>
      <div className={styles.content}>
        <span className={styles.number}>{average}</span>
        <span className={styles.label}>Intensidade média (7 dias)</span>
      </div>
    </div>
  );
};

export default AverageIntensityCard;