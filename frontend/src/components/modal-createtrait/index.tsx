import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';
import styles from './style.module.css';

interface Props { isOpen: boolean; onClose: () => void; userId: number | null; onSuccess: () => void; }

export const CreateTraitModal: React.FC<Props> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      await axios.post(`${apiUrl}/api/traits/${userId}`, { nome, descricao, intensidade: 3 }, { headers: { Authorization: `Bearer ${token}` } });
      onSuccess(); onClose();
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}><h3>Nova Característica</h3><button onClick={onClose}><X/></button></div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input placeholder="Nome da Trait" value={nome} onChange={e => setNome(e.target.value)} className={styles.input} />
          <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className={styles.textarea} />
          <button type="submit" className={styles.submit} disabled={isLoading}>
             {isLoading ? <Loader2 className="animate-spin"/> : "Criar"}
          </button>
        </form>
      </div>
    </div>
  );
};