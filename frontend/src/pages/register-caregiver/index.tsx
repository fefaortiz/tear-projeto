// src/pages/register-caregiver/index.tsx
import React, { useState } from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import styles from './style.module.css'; 
import { Link, useNavigate } from 'react-router-dom'; 
import logoImage from '../../assets/logo_preenchido.png'; 
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
  const [message, setMessage] = useState(''); // Se quiseres usar para feedback visual
  const [isError, setIsError] = useState(false); // Se quiseres usar para feedback visual

  const navigate = useNavigate(); 

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
    setMessage('');

    // 1. Validação Manual Básica (já que desligamos o noValidate do HTML)
    if (!nome || !email || !senha || !cpf) {
        setSubmitError("Por favor, preencha todos os campos obrigatórios.");
        setIsSubmitting(false);
        return;
    }

    // Prepara os dados para envio
    const caregiverData = {
      nome,
      cpf: cpf.replace(/\D/g, ''), // Remove pontos e traços
      telefone: telefone.replace(/\D/g, '') || null, 
      sexo: sexo || null, 
      data_de_nascimento: dataNascimento || null, // ATENÇÃO: O backend geralmente espera 'data_de_nascimento' (com underscores), verifique seu banco.
      email,
      senha, 
    };

    console.log('Enviando dados do cuidador:', caregiverData); 

    try {
      // ATENÇÃO: Ajustei a URL para bater com o seu backend/src/routes/auth.js
      // Verifique no seu server.js se o prefixo é '/api/auth' ou apenas '/auth'
      // Assumindo '/api/auth' como padrão de boas práticas:
      const response = await fetch('http://localhost:3333/api/auth/registerCuidador', { 
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
      alert('Cuidador cadastrado com sucesso!'); // Feedback simples
      
      // Redirecionar para login
      navigate('/login');

    } catch (error: any) {
      console.error('Erro ao cadastrar cuidador:', error);
      setSubmitError(error.message || 'Ocorreu um erro desconhecido.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerCaregiverBackground}>
      <div className={styles.registerCaregiverContainer}> 
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        <h1 className={styles.title}>Seja bem-vindo!</h1>
        <p className={styles.subtitle}>crie uma conta de cuidador</p>
        
        {/* Feedback Message UI (Opcional) */}
        {submitError && (
             <div className={styles.feedbackErrorMessage} style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>
                {submitError}
             </div>
        )}

        {/* ADICIONADO: noValidate para impedir o erro "string did not match pattern" */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            
            <input 
                className={styles.inputField} 
                type="text" 
                id="nome" 
                placeholder="Nome" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required // O React ignora validação visual com noValidate, mas serve de semântica
            />
            
            <input 
                className={styles.inputField} 
                type="email" 
                id="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            
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
            
            <input 
                className={styles.inputField} 
                type="text" 
                id="cpf" 
                value={cpf} 
                onChange={handleCpfChange} 
                placeholder="CPF" 
                maxLength={14} 
                required 
            />
            
            <input 
                className={styles.inputField} 
                type="tel" 
                id="telefone" 
                placeholder="Telefone" 
                value={telefone} 
                onChange={handleTelefoneChange} 
                maxLength={15} 
            />
            
            <input 
                className={styles.inputField} 
                type="date" 
                id="dataNascimento" 
                value={dataNascimento} 
                onChange={(e) => setDataNascimento(e.target.value)} 
            />
            
            <div>
              <select className={styles.inputField} id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="">Selecione seu sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="PrefiroNaoInformar">Prefiro não informar</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.button}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
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