import React from 'react';
import { CheckCircle, User, Activity, Trash2 } from 'lucide-react';
import styles from './style.module.css';

interface TraitCardProps {
  idtraits: number;
  nome: string;
  nota: number | string;
  atualizadoHoje: boolean;
  criador: string | null;
  criadorRole: 'Paciente' | 'Cuidador' | null;
  onRegisterClick: (id: number, nome: string) => void;
  onDeleteClick: (id: number) => void; // Nova prop para deletar
}

export const TraitCard: React.FC<TraitCardProps> = ({ 
  idtraits, 
  nome, 
  nota, 
  atualizadoHoje, 
  criador, 
  //criadorRole,
  onRegisterClick,
  onDeleteClick
}) => {
  const notaDisplay = atualizadoHoje ?`${nota}/5` : '-';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{nome}</h3>
        
        {/* Botão de Deletar (Substitui o badge de status) */}
        <button 
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation(); // Evita cliques acidentais no card se houver
            onDeleteClick(idtraits);
          }}
          title="Excluir esta característica"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoBlock}>
          <span className={styles.label}>Intensidade Hoje:</span>
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
      
      <div className={`${styles.footer} ${atualizadoHoje ? styles.footerSuccess : styles.footerPending}`}>
        {atualizadoHoje ? (
          <p className={styles.successMessage}>
            <CheckCircle size={16} />
            Registro concluído.
          </p>
        ) : (
          <button 
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