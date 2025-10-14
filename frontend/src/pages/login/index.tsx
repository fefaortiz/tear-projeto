import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Usaremos Link para navegar
import './styles.css';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // O backend espera dados de formulário, então usamos URLSearchParams
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // ATENÇÃO: Troque a URL pela URL do seu NOVO backend quando o tiver
      const response = await axios.post('http://127.0.0.1:8000/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const token = response.data.access_token;
      localStorage.setItem('token', token); // Guarda o token no navegador
      
      setMessage('Login realizado com sucesso!');
      setIsError(false); 
      
      // Futuramente, você pode redirecionar o usuário aqui:
      // window.location.href = '/dashboard';

    } catch (error) {
      setMessage('Erro: Usuário ou senha incorretos.');
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="input-group">
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
        
        {message && (
          <p className={isError ? 'feedback-message error' : 'feedback-message success'}>
              {message}
          </p>
        )}

        <p className="toggle-link">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}