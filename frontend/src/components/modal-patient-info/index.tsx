import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, User, Calendar, Mail, Phone, HeartHandshake, Loader2, AlertCircle } from 'lucide-react';
import styles from './style.module.css';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
}

interface PatientDetails {
  idpaciente: number;
  nome: string;
  email: string;
  telefone?: string;
  data_de_nascimento?: string;
  sexo?: string;
  // Dados do Cuidador (vêm do JOIN na query ou de uma chamada específica)
  nome_cuidador?: string;
  email_cuidador?: string;
  telefone_cuidador?: string;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose, patientId }) => {
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails(patientId);
    } else {
        setPatientData(null); // Limpa ao fechar
    }
  }, [isOpen, patientId]);

  const fetchPatientDetails = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      
      // Rota para buscar detalhes completos do paciente (incluindo cuidador)
      // Sugestão: GET /api/pacientes/:id/detalhes (ou apenas /:id se já incluir cuidador)
      const response = await axios.get(`${apiUrl}/api/pacientes/info_cuidador/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPatientData(response.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes do paciente:", err);
      setError("Não foi possível carregar os dados do paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Função auxiliar para calcular idade
  const calculateAge = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  // Formata data para exibição (DD/MM/YYYY)
  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Perfil do Paciente</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
            {isLoading ? (
                <div className={styles.loadingState}>
                    <Loader2 className={styles.spinner} size={40} />
                    <p>Carregando informações...</p>
                </div>
            ) : error ? (
                <div className={styles.errorState}>
                    <AlertCircle size={40} />
                    <p>{error}</p>
                </div>
            ) : patientData ? (
                <>
                    {/* Seção Principal: Dados do Paciente */}
                    <div className={styles.section}>
                        <div className={styles.avatarLarge}>
                            <User size={48} color="#fff" />
                        </div>
                        <h3 className={styles.patientName}>{patientData.nome}</h3>
                        <p className={styles.patientEmail}>{patientData.email}</p>
                    </div>

                    <div className={styles.gridInfo}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}><Calendar size={14}/> Data de Nascimento</span>
                            <span className={styles.value}>{formatDate(patientData.data_de_nascimento)}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Idade</span>
                            <span className={styles.value}>{calculateAge(patientData.data_de_nascimento)} anos</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}><Phone size={14}/> Telefone</span>
                            <span className={styles.value}>{patientData.telefone || 'Não informado'}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Sexo</span>
                            <span className={styles.value}>{patientData.sexo || 'Não informado'}</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Seção Secundária: Dados do Cuidador */}
                    <div className={styles.caregiverSection}>
                        <h4 className={styles.sectionTitle}>
                            <HeartHandshake size={18} className={styles.sectionIcon}/> 
                            Responsável / Cuidador
                        </h4>
                        
                        {patientData.nome_cuidador ? (
                            <div className={styles.caregiverCard}>
                                <div className={styles.caregiverInfo}>
                                    <span className={styles.caregiverName}>{patientData.nome_cuidador}</span>
                                    <div className={styles.caregiverContact}>
                                        <div className={styles.contactRow}>
                                            <Mail size={14} /> {patientData.email_cuidador}
                                        </div>
                                        {patientData.telefone_cuidador && (
                                            <div className={styles.contactRow}>
                                                <Phone size={14} /> {patientData.telefone_cuidador}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.noCaregiver}>Nenhum cuidador vinculado.</p>
                        )}
                    </div>
                </>
            ) : null}
        </div>

        {/* Footer (Ações) */}
        <div className={styles.footer}>
            <button onClick={onClose} className={styles.secondaryButton}>Fechar</button>
            {/* Futuramente pode ter um botão "Editar" ou "Enviar Mensagem" */}
        </div>
      </div>
    </div>
  );
};