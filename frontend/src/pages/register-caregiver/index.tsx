// src/pages/register-caregiver/index.tsx
import React, { useState } from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import styles from './style.module.css'; // Crie este CSS
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

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
    <div className={styles.registerCaregiverContainer}> {/* Reutilize ou crie estilos */}
      <h2>Cadastro de Cuidador</h2>
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
          <label htmlFor="cpf">CPF:</label>
          <input type="text" id="cpf" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" maxLength={14} required />
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

       {submitError && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {submitError}</p>}

        <button type="submit" disabled={isSubmitting}> {/* Desabilita botão */}
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'} {/* Muda texto do botão */}
        </button>
      </form>
    </div>
  );
}

export default RegisterCaregiverPage;