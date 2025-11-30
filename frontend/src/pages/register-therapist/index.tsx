import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css'; // Usaremos os mesmos estilos
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function RegisterTherapistPage() {
  const navigate = useNavigate();

  // Estados do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [crpCrm, setCrpCrm] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funções de formatação (iguais às do paciente para consistência)
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

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

    // Validação básica
    if (!name || !email || !cpf || !crpCrm || !password) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      
      // Envia os dados para o backend (rota de criação de terapeuta)
      // Ajuste o endpoint conforme sua API (/api/terapeutas)
      await axios.post(`${apiUrl}/api/auth/registerTerapeuta`, {
        nome: name,
        email,
        cpf: cpf.replace(/\D/g, ''), // Envia apenas números
        crp_crm: crpCrm,
        telefone,
        sexo,
        data_de_nascimento: dataNascimento,
        senha: password
      });

      // Sucesso: redireciona para login
      navigate('/login');

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err);
        setError(err.response?.data?.error || 'Erro ao realizar cadastro. Verifique os dados.');
      } else {
        console.error(err);
        setError('Erro ao realizar cadastro. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerTherapistBackground}>
      <div className={styles.registerTherapistcontainer}>
        
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        
        <h1 className={styles.title}>Cadastro de Terapeuta</h1>
        <p className={styles.subtitle}>Junte-se à nossa rede de profissionais.</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            className={styles.inputField} 
            placeholder="Nome Completo" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          
          <input 
            className={styles.inputField} 
            placeholder="E-mail Profissional" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <div className={styles.row}>
            <input 
                className={styles.inputField} 
                placeholder="CPF" 
                type="text" 
                value={cpf} 
                onChange={handleCpfChange} 
                maxLength={14}
                required 
            />
            <input 
                className={styles.inputField} 
                placeholder="CRP/CRM" 
                type="text" 
                value={crpCrm} 
                onChange={(e) => setCrpCrm(e.target.value)} 
                required 
            />
          </div>
          
          <div className={styles.row}>
             <input 
                className={styles.inputField} 
                placeholder="Telefone" 
                type="tel" 
                value={telefone} 
                onChange={handleTelefoneChange} 
                maxLength={15} 
            />
            <select 
                className={styles.inputField} 
                value={sexo} 
                onChange={(e) => setSexo(e.target.value)}
            >
                <option value="">Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
            </select>
          </div>

          <div className={styles.inputLabelGroup}>
            <input 
                className={styles.inputField} 
                type="date" 
                value={dataNascimento} 
                onChange={(e) => setDataNascimento(e.target.value)} 
            />
          </div>

          <div className={styles.passwordContainer}>
            <input 
                className={styles.inputField} 
                placeholder="Senha" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
            />
            <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

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