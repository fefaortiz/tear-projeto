import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import styles from './style.module.css';

// --- Tipagem ---
interface IPiramideData {
  faixa: string;
  homens: number;
  mulheres: number;
}

interface IEstadoData {
  uf: string;
  sigla: string;
  percentual: number;
}

interface IStatsData {
  total_brasil: number;
  porcentagem_populacao: number;
  pirâmide_etária: IPiramideData[];
  por_estado: IEstadoData[];
}

const DatavizPage: React.FC = () => {
  const [stats, setStats] = useState<IStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Busca de dados ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3333/api/dataviz/ibge-stats');
        if (!res.ok) throw new Error('Erro ao carregar dados.');
        const data: IStatsData = await res.json();
        setStats(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError(String(e));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className={styles.loading}>Carregando dados...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!stats) return <div>Nenhum dado encontrado.</div>;

  // --- Mapa: geometria simplificada do Brasil ---
  const geoUrl =
    'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Panorama Geral — Autismo no Brasil (Censo 2022)</h1>
        <p>Distribuição da população diagnosticada com TEA por faixa etária, sexo e estado.</p>
      </header>

      {/* KPIs principais */}
      <section className={styles.kpiContainer}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {stats.total_brasil.toLocaleString('pt-BR')}
          </span>
          <span className={styles.kpiLabel}>Pessoas com TEA</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {stats.porcentagem_populacao.toFixed(2)}%
          </span>
          <span className={styles.kpiLabel}>da População Total</span>
        </div>
      </section>

      {/* === Gráficos === */}
      <section className={styles.chartsGrid}>

        {/* Pirâmide Etária */}
        <div className={styles.chartWrapper}>
          <h3>Distribuição Etária por Sexo</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={(stats.pirâmide_etária ?? []).map(d => ({
                faixa: d.faixa,
                homens: d.homens, // negativo para espelhar no eixo X
                mulheres: d.mulheres
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(value) => Math.abs(value).toLocaleString('pt-BR')}
              />
              <YAxis type="category" dataKey="faixa" />
              <Tooltip formatter={(v: number) => Math.abs(v).toLocaleString('pt-BR')} />
              <Legend />
              <Bar dataKey="homens" fill="#38a2ff" name="Homens" stackId="a" />
              <Bar dataKey="mulheres" fill="#ff6efd" name="Mulheres" stackId="a" />
            </BarChart>
          </ResponsiveContainer>


        </div>

        {/* Mapa por Estado */}
        <div className={styles.chartWrapper}>
          <h3>Proporção de Pessoas com TEA por Estado</h3>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 650,     // aumenta o zoom do mapa
              center: [-55, -15] // centraliza o Brasil
            }}
            width={800}
            height={600}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const uf = geo.properties.name;
                  const estado = stats.por_estado.find(e => e.uf === uf);
                  const cor = estado
                    ? `rgba(0, 136, 254, ${estado.percentual / 1.5})`
                    : '#EEE';
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={cor}
                      stroke="#FFF"
                      strokeWidth={0.5}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          <p className={styles.mapNote}>
            *Tons mais escuros representam maior prevalência relativa de TEA.
          </p>
        </div>

      </section>
    </div>
  );
};

export default DatavizPage;
