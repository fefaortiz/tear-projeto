import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css'; // Usaremos os mesmos estilos

export function RegisterPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem!');
      setIsError(true);
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await axios.post(`${apiUrl}/register`, {
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
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Registrar Novo Usuário</h2>
        <div className="input-group">
          <label>Nome:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
            <label>
              CPF: <span className="input-helper"> (apenas números) </span>
            </label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            maxLength={11}
          />
        </div>
        <div className="input-group">
            <label>
              CRP/CRM: <span className="input-helper"> (apenas números) </span>
            </label>
          <input
            type="text"
            value={crpCrm}
            onChange={(e) => setCrpCrm(e.target.value)}
            required
            maxLength={8}
          />
        </div>
        <div className="input-group">
          <label>
              Telefone: <span className="input-helper"> (apenas números) </span>
            </label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
            <label>Sexo:</label>
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value)}
          >
            <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
          <div className="input-group">
          <label>Data de Nascimento:</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Senha:</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label>Confirmar Senha:</label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
        <button type="submit">Registrar</button>
        
        {message && (
          <p className={isError ? 'feedback-message error' : 'feedback-message success'}>
              {message}
          </p>
        )}

        <p className="toggle-link">
          Já tem uma conta? <Link to="/login">Faça o login</Link>
        </p>
      </form>
    </div>
  );
}