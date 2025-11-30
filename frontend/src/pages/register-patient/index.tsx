// src/pages/register-patient/index.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logoImage from '../../assets/logo_preenchido.png';
import styles from './style.module.css';

// Função auxiliar simples para formatar CPF (adicione se não tiver o utils/masking)
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Função auxiliar simples para formatar Telefone
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  
  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados Específicos (Corrigidos)
  const [emailTerapeuta, setEmailTerapeuta] = useState('');
  const [emailCuidador, setEmailCuidador] = useState('');

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      
      // Envia os dados para o backend (rota de criação de paciente)
      await axios.post(`${apiUrl}/api/auth/registerPaciente`, {
        nome,
        cpf: cpf.replace(/\D/g, ''), // Envia apenas números
        telefone,
        sexo,
        data_de_nascimento: dataNascimento,
        email,
        senha,
        emailTerapeuta, // Envia o email do terapeuta vinculado
        emailCuidador   // Envia o email do cuidador vinculado
      });

      // Sucesso: redireciona para login
      navigate('/login');

    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erro ao realizar cadastro. Verifique os dados.');
      } else {
        setError('Erro ao realizar cadastro. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPatientBackground}>
      <div className={styles.registerPatientContainer}>
        
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        
        <h1 className={styles.title}>Crie sua conta</h1>
        <p className={styles.subtitle}>Preencha seus dados para começar.</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            className={styles.inputField} 
            placeholder="Nome Completo" 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />
          
          <input 
            className={styles.inputField} 
            placeholder="CPF" 
            type="text" 
            value={cpf} 
            onChange={handleCpfChange} 
            maxLength={14} 
          />
          
          <input 
            className={styles.inputField} 
            placeholder="Telefone" 
            type="tel" 
            value={telefone} 
            onChange={handleTelefoneChange} 
            maxLength={15} 
          />
          
          <div className={styles.row}>
            <input 
                className={styles.inputField} 
                type="date" 
                value={dataNascimento} 
                onChange={(e) => setDataNascimento(e.target.value)} 
                required
                title="Data de Nascimento"
            />
            
            <select 
                className={styles.inputField} 
                value={sexo} 
                onChange={(e) => setSexo(e.target.value)}
                required
            >
                <option value="">Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="PrefiroNaoInformar">Prefiro não informar</option>
            </select>
          </div>

          <input 
            className={styles.inputField} 
            placeholder="Seu E-mail" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <div className={styles.passwordContainer}>
            <input 
                className={styles.inputField} 
                placeholder="Senha" 
                type={showPassword ? "text" : "password"} 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
            />
            <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <hr className={styles.divider} />
          <p className={styles.sectionTitle}>Vínculos</p>

          {/* --- CORREÇÃO AQUI --- */}
          <input 
            className={styles.inputField} 
            placeholder="E-mail do seu Terapeuta" 
            type="email" 
            value={emailTerapeuta} 
            onChange={(e) => setEmailTerapeuta(e.target.value)} // Usa o setter correto
          />
          
          <input 
            className={styles.inputField} 
            placeholder="E-mail do seu Responsável/Cuidador" 
            type="email" 
            value={emailCuidador} 
            onChange={(e) => setEmailCuidador(e.target.value)} // Usa o setter correto
          />
          {/* --------------------- */}

          <button className={styles.button} type="submit" disabled={loading}> 
            {loading ? <Loader2 className={styles.spinner} /> : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.toggleLink}>
          Já tem uma conta? <Link to="/login" className={styles.loginLink}>Faça login</Link>
        </p>
      </div>
    </div>
  );
}