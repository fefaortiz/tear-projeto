// src/pages/register-patient/index.tsx
import React, { useState} from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import styles from './style.module.css'; // Crie este CSS

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
    <div className={styles.registerPatientContainer}>
      <h2>Cadastro de Paciente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome">Nome Completo:</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="cpf">CPF (Opcional):</label>
          <input type="text" id="cpf" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" maxLength={14} />
        </div>
        <div>
          <label htmlFor="telefone">Telefone:</label>
          <input type="tel" id="telefone" value={telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" maxLength={15} />
        </div>
        <div>
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
          <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sexo">Sexo:</label>
          <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="PrefiroNaoInformar">Prefiro não informar</option>
          </select>
        </div>
        <div>
          <label htmlFor="email terapeuta">Email de seu terapeuta:</label>
          <input type="email" id="emailTerapeuta" value={emailTerapeuta} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div>
          <label htmlFor="email responsável">Email de seu responsável:</label>
          <input type="email" id="emailCuidador" value={emailCuidador} onChange={(e) => setEmail(e.target.value)}/>
        </div>

        {submitError && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {submitError}</p>}

        <button type="submit" disabled={loading || isSubmitting}> {/* Desabilita botão */}
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'} {/* Muda texto do botão */}
        </button>
      </form>
    </div>
  );
  // --- Fim JSX ATUALIZADO ---
}

export default RegisterPatientPage;