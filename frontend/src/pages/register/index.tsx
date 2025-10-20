import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css'; // Usaremos os mesmos estilos

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      // NOTE: O backend atual não tem rota /register implementada.
      // Aqui enviamos para /terapeutas como placeholder — adapte conforme seu backend.
      const response = await axios.post(`${apiUrl}/register`, {
        email: username,
        senha: password
      });
      setMessage(`Usuário '${response.data.username || username}' registrado com sucesso!`);
      setIsError(false);

    } catch (error: any) {
      console.error('Register error:', error);
      setMessage('Erro: ' + (error.response?.data?.error || 'Não foi possível registrar.'));
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Registrar Novo Usuário</h2>
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