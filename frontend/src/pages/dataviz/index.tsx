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
import { scaleLinear } from 'd3-scale'; 
import { Tooltip } from 'react-tooltip'; 
// import 'react-tooltip/dist/react-tooltip.css'; // CSS removido para evitar erros de compilação
import styles from './style.module.css';
import Header from '../../components/header';
import DataVizComponent from '../../components/datavizComponent';
import { ArrowDown, ArrowRight } from 'lucide-react';

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
  total_estado: number; 
  piramide_local: IPiramideData[]; 
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
  const [selectedUf, setSelectedUf] = useState<string | null>(null);

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
  if (error) return <div className={styles.error}>{error};</div>
  if (!stats) return <div>Nenhum dado encontrado.</div>;

  // --- Lógica de Filtro (Cross-Filtering) ---
  const estadoSelecionado = stats.por_estado.find(e => e.uf === selectedUf);

  const kpiTotal = estadoSelecionado?.total_estado || stats.total_brasil;
  const kpiLabel = estadoSelecionado ? `Pessoas com TEA em ${estadoSelecionado.sigla}` : 'Pessoas com TEA (Brasil)';
  
  const kpiPercent = estadoSelecionado?.percentual || stats.porcentagem_populacao;
  const kpiPercentLabel = estadoSelecionado ? `% da População de ${estadoSelecionado.sigla}` : 'da População Total';
  
  const dadosPiramide = estadoSelecionado?.piramide_local || stats.pirâmide_etária;
  const tituloHeader = estadoSelecionado 
    ? `em ${estadoSelecionado.sigla}` 
    : 'no Brasil';

  // --- Lógica da Escala de Cor (Mapa) ---
  const minPercent = Math.min(...stats.por_estado.map(e => e.percentual));
  const maxPercent = Math.max(...stats.por_estado.map(e => e.percentual));

  const colorScale = scaleLinear<string>()
    .domain([minPercent, maxPercent])
    .range(["#e8f0f7ff", "#302e7c"]); 

  // --- Calcular o valor máximo para a simetria (com sua melhoria de 10% de folga) ---
  const maxAbsValue = Math.round(
    1.1 * Math.max(...dadosPiramide.flatMap(d => [Math.abs(d.homens), Math.abs(d.mulheres)]))
  );

  const intermediateValue = Math.round(maxAbsValue / 2); 
  const xAxisTicks = [
    -maxAbsValue,
    -intermediateValue,
    0,
    intermediateValue,
    maxAbsValue
  ];

  const geoUrl =
    'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

  return (
    <div className={styles.pageContainer}>
        <div className={styles.datavizPage}>
            <section className={styles.titleSection}>
            <h2 className="text-4xl font-bold text-indigo-900 text-center mb-4">
              Entenda porque falar sobre autismo <br /> {tituloHeader} é tão importante
            </h2>
            <p>Distribuição da população diagnosticada com TEA por faixa etária, sexo e estado. (censo 2022)</p>
            <ArrowDown className="inline-block ml-2 mb-1 "/>
            </section>
            <Tooltip id="map-tooltip" />
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
                      homens: -d.homens, // Homens como negativo
                      mulheres: d.mulheres
                    }))}
                    // Adiciona um espaçamento entre as categorias (faixas)
                    barCategoryGap="20%" 
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => Math.abs(value).toLocaleString('pt-BR')}
                      domain={[-maxAbsValue, maxAbsValue]}
                      ticks={xAxisTicks}
                    />
                    {/* --- MUDANÇA 1: Eixo Y da Esquerda (Visível) --- */}
                    <YAxis 
                      type="category" 
                      dataKey="faixa" 
                      width={80} 
                      reversed={true} 
                      yAxisId="0" // <-- ID para o eixo esquerdo
                    />
                    
                    {/* --- MUDANÇA 2: Eixo Y da Direita (Invisível) --- */}
                    <YAxis 
                      type="category" 
                      dataKey="faixa"
                      orientation="right" // <-- Posiciona à direita
                      reversed={true} 
                      yAxisId="1" // <-- ID para o eixo direito
                      // --- Esconde ele ---
                      tick={false} 
                      axisLine={false}
                      tickLine={false}
                      width={0}
                    />

                    <RechartsTooltip formatter={(v: number) => Math.abs(v).toLocaleString('pt-BR')} />
                    <Legend />
                    
                    {/* --- MUDANÇA 3: Atribui as barras aos eixos --- */}
                    <Bar dataKey="homens" fill="#38a2ff" name="Homens" yAxisId="0" />
                    <Bar dataKey="mulheres" fill="#ff6efd" name="Mulheres" yAxisId="1" />
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
                        
                        const cor = estado ? colorScale(estado.percentual) : '#EEE';
                        const isSelected = selectedUf === uf;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={cor}
                            stroke={isSelected ? '#20009f' : '#FFF'} 
                            strokeWidth={isSelected ? 2 : 0.5}
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
    </div>
  );
};

export default DatavizPage;