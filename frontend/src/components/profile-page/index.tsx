import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Calendar, Save, Edit2, X, Loader2 } from 'lucide-react';
import styles from './style.module.css';

interface ProfileData {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  data_de_nascimento?: string;
  cpf?: string;
  sexo?: string;
}

interface ProfilePageProps {
  userId: number | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    nome: '',
    email: '',
    telefone: '',
    data_de_nascimento: '',
    cpf: '',
    sexo: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carrega os dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        
        // Rota GET /api/pacientes/:id (assumindo que existe essa rota para buscar dados detalhados)
        // Se não existir, você precisará criá-la ou usar a rota /auth/me se ela retornar tudo
        const response = await axios.get(`${apiUrl}/api/pacientes/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Formata a data para o input date (YYYY-MM-DD)
        const data = response.data;
        if (data.data_de_nascimento) {
            data.data_de_nascimento = data.data_de_nascimento.split('T')[0];
        }

        setProfileData(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados do perfil.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';

      // Rota PUT /api/pacientes/:id
      await axios.put(`${apiUrl}/api/pacientes/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error(err);
      setError('Erro ao salvar as alterações.');
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
        {/* Avatar Section (Visual Only for now) */}
        <div className={styles.avatarSection}>
            <div className={styles.avatar}>
                <User size={40} color="#7C3AED" />
            </div>
            <div className={styles.avatarInfo}>
                <h3 className={styles.avatarName}>{profileData.nome || 'Paciente'}</h3>
            </div>
        </div>

        <div className={styles.grid}>
            {/* Nome Completo */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Nome Completo</label>
                <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input 
                        type="text" 
                        name="nome"
                        value={profileData.nome} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Email (Geralmente Read-only ou requer confirmação, deixarei editável mas cuidado) */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>E-mail</label>
                <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input 
                        type="email" 
                        name="email"
                        value={profileData.email} 
                        onChange={handleInputChange}
                        disabled={true} // Email geralmente é chave de login, melhor não editar fácil
                        className={`${styles.input} ${styles.disabledInput}`}
                        title="Para alterar o e-mail, entre em contato com o suporte."
                    />
                </div>
            </div>

            {/* Telefone */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Telefone</label>
                <div className={styles.inputWrapper}>
                    <Phone size={18} className={styles.inputIcon} />
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
                <div className={styles.inputWrapper}>
                    <Calendar size={18} className={styles.inputIcon} />
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
};