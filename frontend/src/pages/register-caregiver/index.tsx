// src/pages/register-caregiver/index.tsx
import React, { useState } from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import './style.css'; // Crie este CSS

function RegisterCaregiverPage() {

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      nome,
      cpf: cpf.replace(/\D/g, ''),
      telefone: telefone.replace(/\D/g, ''),
      sexo,
      dataNascimento,
      email,
      senha,
    });
    alert('Cadastro de Cuidador (simulado)');
  };

  return (
    <div className="register-container"> {/* Reutilize ou crie estilos */}
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

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default RegisterCaregiverPage;