import React from 'react';
import { CheckCircle, XCircle, User, Activity } from 'lucide-react';
import styles from './style.module.css';

interface TraitCardProps {
  idtraits: number;
  nome: string;
  nota: number | string;
  atualizadoHoje: boolean;
  criador: string | null;
  criadorRole: 'Paciente' | 'Cuidador' | null;
  // Esta função conecta o Card à Home Page, que abrirá o Modal
  onRegisterClick: (id: number, nome: string) => void; 
}

export const TraitCard: React.FC<TraitCardProps> = ({ 
  idtraits, 
  nome, 
  nota, 
  atualizadoHoje, 
  criador, 
  // criadorRole,
  onRegisterClick 
}) => {
  const notaDisplay = typeof nota === 'number' ? `${nota}/5` : nota;

  return (
    <div className={styles.card}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h3 className={styles.title}>{nome}</h3>
        <div className={`${styles.statusBadge} ${atualizadoHoje ? styles.statusUpdated : styles.statusPending}`}>
          {atualizadoHoje ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{atualizadoHoje ? 'Atualizado' : 'Pendente'}</span>
        </div>
      </div>

      {/* Informações */}
      <div className={styles.infoGrid}>
        <div className={styles.infoBlock}>
          <span className={styles.label}>Intensidade:</span>
          <span className={`${styles.value} ${typeof nota === 'number' ? styles.valueHighlight : styles.valueDimmed}`}>
            {notaDisplay}
          </span>
        </div>

        <div className={styles.infoBlock}>
          <span className={styles.label}>Criado por:</span>
          <div className={styles.creatorInfo}>
            <User size={14} className={styles.iconDimmed} />
            <span className={styles.creatorName}>
              {criador ? `${criador}` : 'Sistema'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Rodapé com Botão de Ação */}
      <div className={`${styles.footer} ${atualizadoHoje ? styles.footerSuccess : styles.footerPending}`}>
        {atualizadoHoje ? (
          <p className={styles.successMessage}>
            <CheckCircle size={16} />
            Registro concluído.
          </p>
        ) : (
          <button 
            // Ao clicar, passamos o ID e Nome para a função pai (HomePage)
            onClick={() => onRegisterClick(idtraits, nome)}
            className={styles.actionButton}
            title="Clique para registrar como você se sente hoje"
          >
            <Activity size={18} />
            Registrar Hoje
          </button>
        )}
      </div>
    </div>
  );
};