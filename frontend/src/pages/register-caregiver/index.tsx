// src/pages/register-caregiver/index.tsx
import React, { useState } from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import styles from './style.module.css'; // Crie este CSS
import { Link, useNavigate } from 'react-router-dom'; // Importe useNavigate
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff } from 'lucide-react';

function RegisterCaregiverPage() {

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate(); // Hook para navegação

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Prepara os dados para envio
    const caregiverData = {
      nome,
      cpf: cpf.replace(/\D/g, ''), // Envia apenas números
      telefone: telefone.replace(/\D/g, '') || null, // Envia apenas números ou null
      sexo: sexo || null, // Garante null se não selecionado
      dataNascimento: dataNascimento || null, // Garante null se vazio
      email,
      senha, // Backend fará o hash
    };

    console.log('Enviando dados do cuidador:', caregiverData); // Para debug

    try {
      const response = await fetch('http://localhost:3333/register/caregiver', { // URL da API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caregiverData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Sucesso!
      console.log('Cadastro de Cuidador realizado:', responseData);
      alert('Cuidador cadastrado com sucesso! ID: ' + responseData.id);

      // Opcional: Redirecionar para login
      navigate('/login');

    } catch (error: any) {
      console.error('Erro ao cadastrar cuidador:', error);
      setSubmitError(error.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerCaregiverBackground}>
      <div className={styles.registerCaregiverContainer}> 
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        <h1 className={styles.title}>Seja bem-vindo!</h1>
        <p className={styles.subtitle}>crie uma conta</p>
        
          {message && (
            <p className={isError ? styles.feedbackErrorMessage : styles.feedbackSuccessMessage}>
                {message}
            </p>
          )}

        <form onSubmit={handleSubmit} className={styles.form}>
            <input className={styles.inputField} type="text" id="nome" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input className={styles.inputField} type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className={styles.passwordContainer}>
              <input 
                placeholder="Senha" 
                className={styles.inputField} 
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
            <input className={styles.inputField} type="text" id="cpf" value={cpf} onChange={handleCpfChange} placeholder="CPF" maxLength={14} required />
            <input className={styles.inputField} type="tel" id="telefone" placeholder="telefone" value={telefone} onChange={handleTelefoneChange} maxLength={15} />
            <input className={styles.inputField} type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            <div>
              <select className={styles.inputField}  id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="">Selecione seu sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="PrefiroNaoInformar">Prefiro não informar</option>
              </select>
            </div>

        {submitError && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {submitError}</p>}

          <button type="submit" disabled={isSubmitting} className={styles.button}> {/* Desabilita botão */}
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'} {/* Muda texto do botão */}
          </button>
        </form>

          <p className={styles.toggleLink}>
            Já tem uma conta? <Link to="/login"> <span className={styles.login} >Entrar</span></Link>
          </p>
      </div>
    </div>

  );
}

export default RegisterCaregiverPage;