import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Calendar, Save, Edit2, X, Loader2, FileBadge } from 'lucide-react';
import styles from './style.module.css';

// Interface unificada que cobre campos de todos os perfis
interface ProfileData {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  data_de_nascimento?: string;
  cpf?: string;
  sexo?: string;
  crp_crm?: string; // Específico para Terapeuta
  emailterapeuta?: string; // Específico para Paciente
  emailcuidador?: string; // Específico para Paciente
}

interface ProfilePageProps {
  userId: number | null;
  userRole: 'paciente' | 'terapeuta' | 'cuidador' | null; // Adicionada prop userRole
}

const getApiEndpoint = (role: 'paciente' | 'terapeuta' | 'cuidador' | null) => {
  switch (role) {
      case 'paciente': return '/api/pacientes';
      case 'terapeuta': return '/api/terapeutas';
      case 'cuidador': return '/api/cuidadores';
      default: return null;
  }
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    nome: '',
    email: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carrega os dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !userRole) return;
      
      const endpointBase = getApiEndpoint(userRole);
      if (!endpointBase) {
          setError('Tipo de usuário inválido.');
          return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        // Rota GET /api/{role}/{id} 
        const response = await axios.get(`${apiUrl}${endpointBase}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        // Formata data para o input (YYYY-MM-DD) se vier no formato ISO
        if (data.data_de_nascimento) {
            data.data_de_nascimento = data.data_de_nascimento.split('T')[0];
        }

        setProfileData(data);
      } catch (err: any) {
        console.error(err);
        setError('Erro ao carregar dados do perfil.');
        if (err.response?.status === 404) {
             setError('Perfil não encontrado.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, userRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpointBase = getApiEndpoint(userRole);
    if (!endpointBase) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';

      // Rota PUT /api/{role}/:id      
      const updateUrl = `${apiUrl}${endpointBase}/${userId}`;

      await axios.put(updateUrl, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={48} />
            <p>Carregando perfil...</p>
        </div>
    );
  }

  // Função auxiliar para capitalizar o role
  const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Usuário';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
            <h2 className={styles.title}>Meu Perfil</h2>
            <p className={styles.subtitle}>Gerencie suas informações pessoais</p>
        </div>
        {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                <Edit2 size={18} /> Editar
            </button>
        ) : (
            <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                <X size={18} /> Cancelar
            </button>
        )}
      </div>

      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSave} className={styles.form}>
        {/* Avatar Section */}
        <div className={styles.avatarSection}>
            <div className={styles.avatar}>
                <User size={40} color="#7C3AED" />
            </div>
            <div className={styles.avatarInfo}>
                <h3 className={styles.avatarName}>{profileData.nome || displayRole}</h3>
                <span className={styles.avatarRole}>{displayRole}</span>
            </div>
        </div>

        <div className={styles.grid}>
            {/* Nome Completo */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Nome Completo</label>
                <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}><User size={18} /></div>
                    <input 
                        type="text" 
                        name="nome"
                        value={profileData.nome || ''} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Email (Read-only) */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>E-mail</label>
                <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}><Mail size={18} /></div>
                    <input 
                        type="email" 
                        name="email"
                        value={profileData.email || ''} 
                        onChange={handleInputChange}
                        disabled={true} 
                        className={`${styles.input} ${styles.disabledInput}`}
                    />
                </div>
            </div>

            {/* Telefone */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Telefone</label>
                <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}><Phone size={18} /></div>
                    <input 
                        type="tel" 
                        name="telefone"
                        value={profileData.telefone || ''} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={styles.input}
                        placeholder="(XX) XXXXX-XXXX"
                    />
                </div>
            </div>

            {/* Data de Nascimento */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Data de Nascimento</label>
                <div className={[styles.inputWrapper, styles.dateInputWrapper].join(' ')}>
                    <div className={styles.inputIcon}><Calendar size={18} /></div>
                    <input 
                        type="date" 
                        name="data_de_nascimento"
                        value={profileData.data_de_nascimento || ''} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* CPF (Read-only) */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>CPF</label>
                <input 
                    type="text" 
                    name="cpf"
                    value={profileData.cpf || ''} 
                    disabled={true}
                    className={`${styles.input} ${styles.disabledInput}`}
                />
            </div>

            {/* Sexo */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Sexo</label>
                <select
                    name="sexo"
                    value={profileData.sexo || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={styles.select}
                >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>

            {/* Campo Específico para Terapeuta: CRP/CRM */}
            {userRole === 'terapeuta' && (
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>CRP / CRM</label>
                    <div className={styles.inputWrapper}>
                        <div className={styles.inputIcon}><FileBadge size={18} /></div>
                        <input 
                            type="text" 
                            name="crp_crm"
                            value={profileData.crp_crm || ''} 
                            onChange={handleInputChange}
                            disabled={!isEditing} // Pode ser editável ou não, dependendo da sua regra de negócio
                            className={styles.input}
                        />
                    </div>
                </div>
            )}

            {/* Campo Específico para Paciente (email Cuidador) */}
            {userRole === 'paciente' && (
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email do Cuidador</label>
                    <div className={styles.inputWrapper}>
                        <div className={styles.inputIcon}><Mail size={18} /></div>
                        <input 
                            type="text" 
                            name="emailcuidador"
                            value={profileData.emailcuidador || ''} 
                            onChange={handleInputChange}
                            disabled={true}
                            className={styles.input}
                        />
                    </div>
                </div>
            )}

            {/* Campo Específico para Paciente (email Terapeuta) */}
            {userRole === 'paciente' && (
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email do Terapeuta</label>
                    <div className={styles.inputWrapper}>
                        <div className={styles.inputIcon}><Mail size={18} /></div>
                        <input 
                            type="text" 
                            name="emailterapeuta"
                            value={profileData.emailterapeuta || ''} 
                            onChange={handleInputChange}
                            disabled={true}
                            className={styles.input}
                        />
                    </div>
                </div>
            )}
        </div>

        {isEditing && (
            <div className={styles.footer}>
                <button type="submit" className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                    Salvar Alterações
                </button>
            </div>
        )}
      </form>
    </div>
  );
}
