import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale'; // <-- 1. Importar D3 Scale
import { Tooltip } from 'react-tooltip'; // <-- 2. Importar React Tooltip
import 'react-tooltip/dist/react-tooltip.css'; // <-- 3. Importar CSS do Tooltip
import styles from './style.module.css';

// --- Tipagem ---
// (Recomendação: Mova estas interfaces para um arquivo .types.ts)
interface IPiramideData {
  faixa: string;
  homens: number;
  mulheres: number;
}

interface IEstadoData {
  uf: string;
  sigla: string;
  percentual: number;
  total_estado: number; // [NOVO] Dado necessário para o filtro
  piramide_local: IPiramideData[]; // [NOVO] Dado necessário para o filtro
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
  
  // --- 4. Estado de Seleção ---
  const [selectedUf, setSelectedUf] = useState<string | null>(null);

  // --- Busca de dados ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Assume que o endpoint agora retorna os dados detalhados por estado
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

  // --- 5. Lógica de Filtro (Cross-Filtering) ---
  const estadoSelecionado = stats.por_estado.find(e => e.uf === selectedUf);

  const kpiTotal = estadoSelecionado?.total_estado || stats.total_brasil;
  const kpiLabel = estadoSelecionado ? `Pessoas com TEA em ${estadoSelecionado.sigla}` : 'Pessoas com TEA (Brasil)';
  
  const kpiPercent = estadoSelecionado ? estadoSelecionado.percentual : stats.porcentagem_populacao;
  const kpiPercentLabel = estadoSelecionado ? `% da População de ${estadoSelecionado.sigla}` : 'da População Total';
  
  const dadosPiramide = estadoSelecionado ? estadoSelecionado.piramide_local : stats.pirâmide_etária;
  const tituloHeader = estadoSelecionado 
    ? `Panorama — ${estadoSelecionado.uf} (Censo 2022)` 
    : 'Panorama Geral — Autismo no Brasil (Censo 2022)';

  // --- 6. Lógica da Escala de Cor (Mapa) ---
  const minPercent = Math.min(...stats.por_estado.map(e => e.percentual));
  const maxPercent = Math.max(...stats.por_estado.map(e => e.percentual));

  const colorScale = scaleLinear<string>()
    .domain([minPercent, maxPercent])
    .range(["#E3F2FD", "#0D47A1"]); // De: Azul bem claro -> Para: Azul escuro

  // --- Mapa: geometria simplificada do Brasil ---
  const geoUrl =
    'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>{tituloHeader}</h1> {/* Título dinâmico */}
        <p>Distribuição da população diagnosticada com TEA por faixa etária, sexo e estado.</p>
        {estadoSelecionado && (
          <button 
            className={styles.clearButton} // (Adicione este estilo no seu CSS)
            onClick={() => setSelectedUf(null)}
          >
            Limpar seleção (Ver Brasil)
          </button>
        )}
      </header>
      
      {/* 7. Tooltip Global para o Mapa */}
      <Tooltip id="map-tooltip" />

      {/* KPIs principais (agora dinâmicos) */}
      <section className={styles.kpiContainer}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {kpiTotal.toLocaleString('pt-BR')}
          </span>
          <span className={styles.kpiLabel}>{kpiLabel}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>
            {kpiPercent.toFixed(2)}%
          </span>
          <span className={styles.kpiLabel}>{kpiPercentLabel}</span>
        </div>
      </section>

      {/* === Gráficos === */}
      <section className={styles.chartsGrid}>

        {/* Pirâmide Etária (agora dinâmica) */}
        <div className={styles.chartWrapper}>
          <h3>Distribuição Etária por Sexo</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={(dadosPiramide ?? []).map(d => ({
                faixa: d.faixa,
                homens: d.homens, // <-- 8. CORREÇÃO DA PIRÂMIDE
                mulheres: d.mulheres
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(value) => Math.abs(value).toLocaleString('pt-BR')}
              />
              <YAxis type="category" dataKey="faixa" width={80} />
              <RechartsTooltip formatter={(v: number) => Math.abs(v).toLocaleString('pt-BR')} />
              <Legend />
              <Bar dataKey="homens" fill="#38a2ff" name="Homens" stackId="a" />
              <Bar dataKey="mulheres" fill="#ff6efd" name="Mulheres" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mapa por Estado (agora interativo) */}
        <div className={styles.chartWrapper}>
          <h3>Proporção de Pessoas com TEA por Estado</h3>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 650,
              center: [-55, -15]
            }}
            width={800}
            height={600}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const uf = geo.properties.name;
                  const estado = stats.por_estado.find(e => e.uf === uf);
                  
                  // 9. Lógica de Cor e Interação
                  const cor = estado ? colorScale(estado.percentual) : '#EEE';
                  const isSelected = selectedUf === uf;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={cor}
                      stroke={isSelected ? '#20009f' : '#FFF'} // Destaque se selecionado
                      strokeWidth={isSelected ? 2 : 0.5}
                      // --- 10. ATRIBUTOS DE INTERAÇÃO ---
                      data-tooltip-id="map-tooltip"
                      data-tooltip-content={
                        estado 
                          ? `${estado.uf}: ${estado.percentual.toFixed(2)}%` 
                          : `${uf}: Sem dados`
                      }
                      onClick={() => {
                        setSelectedUf(selectedUf === uf ? null : uf);
                      }}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#20009f', stroke: '#333', strokeWidth: 1.5, outline: 'none', cursor: 'pointer' },
                        pressed: { fill: '#20009f', outline: 'none' },
                      }}
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