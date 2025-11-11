// src/pages/register-patient/index.tsx
import React, { useState} from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import { useNavigate, Link } from 'react-router-dom'; // Importe useNavigate
import styles from './style.module.css'; // Crie este CSS
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff } from 'lucide-react';

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

  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento (opcional)
  const [error, setError] = useState<string | null>(null); // Estado de erro (opcional)
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
    e.preventDefault(); // Impede o recarregamento padrão da página
    setIsSubmitting(true); // Indica que o envio começou
    setSubmitError(null); // Limpa erros anteriores

    const patientData = {
      nome,
      // Envia CPF apenas se houver algum dígito, senão envia null
      cpf: cpf.replace(/\D/g, '') || null,
      // Envia telefone apenas se houver algum dígito, senão envia null
      telefone: telefone.replace(/\D/g, '') || null,
      sexo: sexo || null, // Garante null se não selecionado
      dataNascimento: dataNascimento || null, // Garante null se vazio
      email,
      senha, // A senha será hasheada no backend
      emailTerapeuta,
      emailCuidador
    };

    console.log('Enviando dados do paciente:', patientData); // Para debug

    try {
      const response = await fetch('http://localhost:3333/register/patient', { // URL da sua API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const responseData = await response.json(); // Tenta parsear JSON mesmo em erro

      if (!response.ok) {
        // Se a resposta não for OK (status 4xx ou 5xx)
        throw new Error(responseData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Sucesso!
      console.log('Cadastro de Paciente realizado:', responseData);
      alert('Paciente cadastrado com sucesso! ID: ' + responseData.id);

      // Opcional: Redirecionar para login após sucesso
      navigate('/login'); // Ou para outra página de sucesso/dashboard

    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      // Define a mensagem de erro para exibir ao usuário
      setSubmitError(error.message || 'Ocorreu um erro desconhecido.');
      // alert('Erro ao cadastrar: ' + error.message); // Pode remover o alert se usar o estado submitError
    } finally {
      setIsSubmitting(false); // Indica que o envio terminou (sucesso ou falha)
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
          <input className={styles.inputField} placeholder="email de seu terapeuta" type="email" id="emailTerapeuta" value={emailTerapeuta} onChange={(e) => setEmail(e.target.value)}/>
          <input className={styles.inputField} placeholder="email de seu responsável" type="email" id="emailCuidador" value={emailCuidador} onChange={(e) => setEmail(e.target.value)}/>
        <button className={styles.button} type="submit" disabled={loading || isSubmitting}> 
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