import logoImage from '../assets/logo_preenchido.png';  // Importe a imagem do logo
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-10 py-6">
    <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
      {/* Logo com a fonte de "personalidade" (bold) e cor de destaque */}
        <img src={logoImage} alt="Logo tear" style={{ width: '40px' }} />
      {/* Navegação */}
      <nav className="hidden md:flex items-center gap-6 text-indigo-800 font-medium">
        <a href="#solucao" className="hover:text-violet-500 transition-colors">Como Funciona</a>
        <a href="#features" className="hover:text-violet-500 transition-colors">Funcionalidades</a>
        <a href="#missao" className="hover:text-violet-500 transition-colors">Nossa Missão</a>
        <Link to="/dataviz" className="hover:text-violet-500 transition-colors">
          TEA no Brasil
        </Link>
      </nav>
      {/* Botões de Ação */}
      <div className="flex items-center gap-4">
        <Link to="/login">
        <button className="font-semibold text-indigo-800 py-2 px-5 rounded-full transition-transform hover:scale-105">
          Entrar
        </button>
        </Link>
        <Link to="/register/select">
          <button className="bg-violet-500 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105 hover:bg-violet-600">
            Criar Conta
          </button>
        </Link>

      </div>
    </div>
  </header>
);

export default Header;