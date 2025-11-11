import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css';

export function InitialPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.initialRoot}>
      <div className={styles.initialContainer}>
        <h1>Bem-vindo à página inicial</h1>
        <p>Você está logado com sucesso.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleLogout}>Sair</button>
          <Link to="/">Voltar</Link>
        </div>
      </div>
    </div>
  );
}

export default InitialPage;
