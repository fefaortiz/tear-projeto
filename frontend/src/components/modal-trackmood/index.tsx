import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import styles from './style.module.css';

interface TrackMoodProps {
  isOpen: boolean;
  onClose: () => void;
  traitId: number | null;
  traitName: string | null;
  onSuccess: () => void; // Callback para atualizar a lista na Home
}

export const TrackMoodModal: React.FC<TrackMoodProps> = ({ 
  isOpen, 
  onClose, 
  traitId, 
  traitName,
  onSuccess 
}) => {
  const [intensidade, setIntensidade] = useState<number | null>(null);
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !traitId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (intensidade === null) {
      setError('Por favor, selecione uma intensidade.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');

      // Chama a rota POST /api/tracking/:idtraits
      await axios.post(
        `${apiUrl}/api/tracking/${traitId}`,
        {
          intensidade,
          descricao,
          dia_de_registro: new Date().toISOString().split('T')[0] // Data atual
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Sucesso
      setDescricao('');
      setIntensidade(null);
      onSuccess(); // Atualiza a página pai
      onClose(); // Fecha o modal

    } catch (err: unknown) {
      console.error(err);
      const msg = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'Erro ao salvar o tracking.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Registrar: <span className={styles.highlight}>{traitName}</span>
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Seleção de Intensidade */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Qual a intensidade hoje? (1 a 5)</label>
            <div className={styles.intensitySelector}>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.intensityBtn} ${intensidade === level ? styles.intensityBtnSelected : ''}`}
                  onClick={() => setIntensidade(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className={styles.fieldGroup}>
            <label htmlFor="desc" className={styles.label}>Descrição / Justificativa</label>
            <textarea
              id="desc"
              className={styles.textarea}
              placeholder="Descreva brevemente como você se sentiu..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Registro
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};