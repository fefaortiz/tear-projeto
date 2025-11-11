import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Usaremos Link para navegar
import styles from './style.module.css';
import logoImage from '../../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Eye, EyeOff } from 'lucide-react';


export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
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
    <div className={styles.loginBackground}>
      <div className={styles.loginContainer}>
        {message && (
        <p className={isError ? styles.feedbackErrorMessage : styles.feedbackSuccessMessage}>
                {message}
        </p>
          )}
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Senha:</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submit}>Entrar</button>

          <p className="toggle-link">
            Não tem uma conta? <Link to="/register/select" className={styles.linkCadastro}>Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>

  );
}

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email: username,
        senha: password
      });

      // Se o backend retornar um token
      const token = response.data.token || response.data.access_token;
      if (token) localStorage.setItem('token', token);
      setIsError(false);

      // Redirecionar para a página inicial usando React Router
      navigate('/initial');

    } catch (error: unknown) {
      console.error('Login error:', error);
      setMessage('Usuário ou senha incorretos.');
      setIsError(true);
    }
  };
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        <img src={logoImage} alt="Logo Tear" className={styles.logo} />
        
        <h1 className={styles.title}>Bem-vindo de volta!</h1>
        <p className={styles.subtitle}>Acesse sua conta.</p>
        
          {message && (
            <p className={isError ? styles.feedbackErrorMessage : styles.feedbackSuccessMessage}>
                {message}
            </p>
          )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="E-mail" 
            className={styles.inputField} 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className={styles.passwordContainer}>
            <input 
              placeholder="Senha" 
              className={styles.inputField} 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          
          <div className={styles.actionsRow}>
            <div className={styles.checkboxContainer}>
              <input type="checkbox" id="lembrar" name="lembrar" />
              <label htmlFor="lembrar">Lembrar de mim</label>
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                Entrar
              </button>
              <Link to="/register/select" className={`${styles.button} ${styles.buttonSecondary}`}>
                Criar Conta
              </Link>
            </div>
          </div>
          
          <a href="#" className={styles.forgotPassword}>Esqueci minha senha</a>
        </form>
      </div>
    </div>
  );
}