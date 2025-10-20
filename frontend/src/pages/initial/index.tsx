import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';

export function InitialPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="form-container">
      <h1>Bem-vindo à página inicial</h1>
      <p>Você está logado com sucesso.</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleLogout}>Sair</button>
        <Link to="/">Voltar</Link>
      </div>
    </div>
  );
}

export default InitialPage;
