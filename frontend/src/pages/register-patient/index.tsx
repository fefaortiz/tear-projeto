// src/pages/register-patient/index.tsx
import React, { useState} from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import { useNavigate, Link } from 'react-router-dom'; // Importe useNavigate
import styles from './style.module.css'; // Crie este CSS
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

function RegisterPatientPage() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState(''); // CPF é opcional aqui
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailTerapeuta, setEmailTerapeuta ] = useState(''); // Email do terapeuta associado
  const [emailCuidador, setEmailCuidador ] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    setIsError(false);

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
        setMessage(err.response?.data?.error || 'Erro ao realizar cadastro. Verifique os dados.');
      } else {
        setMessage('Erro ao realizar cadastro. Verifique os dados.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <div className={styles.registerPatientBackground}>
      <div className={styles.registerPatientContainer}>
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        <h1 className={styles.title}>Seja bem-vindo!</h1>
        <p className={styles.subtitle}>crie uma conta</p>
        
          {message && (
            <p className={isError ? styles.feedbackErrorMessage : styles.feedbackSuccessMessage}>
                {message}
            </p>
          )}

      <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.inputField} placeholder="Nome" type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <input className={styles.inputField} placeholder="email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          <input className={styles.inputField} placeholder="CPF" type="text" id="cpf" value={cpf} onChange={handleCpfChange}  maxLength={14} />
          <input className={styles.inputField} placeholder="Telefone" type="tel" id="telefone" value={telefone} onChange={handleTelefoneChange}  maxLength={15} />
          <input className={styles.inputField} type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
          <select className={styles.inputField} id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Selecione seu sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="PrefiroNaoInformar">Prefiro não informar</option>
          </select>
          <input className={styles.inputField} placeholder="email de seu terapeuta" type="email" id="emailTerapeuta" value={emailTerapeuta} onChange={(e) => setEmailTerapeuta(e.target.value)}/>
          <input className={styles.inputField} placeholder="email de seu cuidador / responsável" type="email" id="emailCuidador" value={emailCuidador} onChange={(e) => setEmailCuidador(e.target.value)}/>
        <button className={styles.button} type="submit" disabled={isSubmitting}> 
          Cadastrar
        </button>
      </form>


        <p className={styles.toggleLink}>
          Já tem uma conta? <Link to="/login"> <span className={styles.login} >Entrar</span></Link>
        </p>
    </div>
    </div>

  );
  // --- Fim JSX ATUALIZADO ---
}

export default RegisterPatientPage;