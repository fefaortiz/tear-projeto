// src/componentes/modal/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css'; // Vamos precisar criar este arquivo de estilo
import './Form.css';

// 1. Definindo os tipos das Props (TypeScript)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // Uma função que não recebe nada e não retorna nada
  children: React.ReactNode; // 'children' pode ser qualquer coisa que o React renderiza
}

// 2. Buscando o elemento 'modal-root' do DOM
// Fazemos isso fora do componente para não ser re-executado a cada render
const modalRootEl = document.getElementById('modal-root');

// 3. A lógica do componente
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // Se não houver um 'modal-root', não renderize o portal (boa prática)
  if (!modalRootEl) {
    console.error("Elemento 'modal-root' não encontrado no DOM.");
    return null;
  }

  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) {
    return null;
  }

  // 4. Usando o Portal
  // O React renderiza o JSX abaixo dentro do 'modalRootEl'
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        {children}

      </div>
    </div>,
    modalRootEl 
  );
};

export default Modal;