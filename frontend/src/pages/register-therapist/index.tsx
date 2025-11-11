import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css'; // Usaremos os mesmos estilos
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff } from 'lucide-react';

export function RegisterTherapistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [crpCrm, setCrpCrm] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

const formatCPF = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  const truncatedDigits = digitsOnly.substring(0, 11);
  const len = truncatedDigits.length;
  if (len <= 3) {
    return truncatedDigits;
  } else if (len <= 6) {
    return truncatedDigits.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
  } else if (len <= 9) {
    return truncatedDigits.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else {
    return truncatedDigits.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }
};
const formatPhone = (value: string): string => {
    // 1. Remove tudo que não for dígito
    const digitsOnly = value.replace(/\D/g, '');

    // 2. Limita a 11 dígitos (máximo para celular com DDD)
    const truncatedDigits = digitsOnly.substring(0, 11);
    const len = truncatedDigits.length;

    if (len <= 2) {
      return truncatedDigits.replace(/^(\d{0,2})/, '($1');
    } else if (len <= 6) {
      return truncatedDigits.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    } else if (len <= 10) {
      return truncatedDigits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return truncatedDigits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(event.target.value);
    setTelefone(formattedValue);
  };


  const handleCpfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(event.target.value);
    setCpf(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem!');
      setIsError(true);
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await axios.post(`${apiUrl}/api/auth/registerTerapeuta`, {
        nome: name,
        email: email,
        senha: password,
        cpf: cpf,
        crp_crm: crpCrm,
        telefone: telefone,
        sexo: sexo,
        data_de_nascimento: dataNascimento
      });

      // Se o backend retornar um token, salvamos ele
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      setMessage(response.data.message || 'Usuário cadastrado com sucesso!');
      setIsError(false);

      // Redirecionar para a página de login após 1 segundo
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);

    } catch (error) {
      console.error('Register error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setMessage(`Erro: ${error.response.data.error}`);
      } else {
        setMessage('Erro: Não foi possível registrar. Por favor, tente novamente.');
      }
      setIsError(true);
    }
  };

  return (
    <div className={styles.registerTherapistBackground}> 
      <div className={styles.registerTherapistcontainer}>
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        <h1 className={styles.title}>Seja bem-vindo!</h1>
        <p className={styles.subtitle}>crie uma conta</p>
        {message && (
          <p className={isError ? styles.feedbackErrorMessage : styles.feedbackSuccessMessage}>
              {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
            <input
              placeholder='Nome'
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder='Email'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder='CPF'
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              required
              maxLength={14}
            />
            <input
              placeholder='CRP/CRM'
              type="text"
              value={crpCrm}
              onChange={(e) => setCrpCrm(e.target.value)}
              required
              maxLength={8}
            />
            <input
              placeholder='Telefone'
              type="tel"
              value={telefone}
              onChange={handlePhoneChange}
              required
            />
          <select className={styles.inputField} id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Selecione seu sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="PrefiroNaoInformar">Prefiro não informar</option>
          </select>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
            />
          <div className={styles.passwordContainer}>
            <input 
              placeholder="Senha" 
              className={styles.inputField} 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div> 
          <button type="submit" className={styles.button}>Registrar</button>


          <p className={styles.toggleLink}>
            Já tem uma conta? <Link to="/login"> <span className={styles.login} >Entrar</span></Link>
          </p>
        </form>
      </div>
    </div>
  );
}