import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Usaremos Link para navegar
import './style.css'; // Reutilizando os mesmos estilos da página de registro

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // O backend deste projeto espera { email, senha } em JSON
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await axios.post(`${apiUrl}/login`, {
        email: username,
        senha: password
      });

      // Se o backend retornar um token
      const token = response.data.token || response.data.access_token;
      if (token) localStorage.setItem('token', token);

      setMessage('Login realizado com sucesso!');
      setIsError(false);

      // Redirecionar para a página inicial usando React Router
      navigate('/initial');

    } catch (error: unknown) {
      console.error('Login error:', error);
      setMessage('Erro: Usuário ou senha incorretos.');
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="input-group">
          <label>Email:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">Entrar</button>
        
        {message && (
          <p className={isError ? 'feedback-message error' : 'feedback-message success'}>
              {message}
          </p>
        )}

        <p className="toggle-link">
          Não tem uma conta? <Link to="/register/select">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}