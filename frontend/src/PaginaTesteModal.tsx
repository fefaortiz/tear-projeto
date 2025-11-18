import React, { useState } from 'react';

// 1. O caminho do modal que você está usando
import Modal from './components/modal'; 

// 2. Importar o componente de formulário que criamos
import UpdateFormularioRegistro from './components/modal-updatetrack'; 
import './components/modal/Form.css';

function PaginaTesteModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Página de Teste do Modal</h1>
      <p>Esta página existe apenas para testar o componente modal.</p>
      
      <hr style={{ margin: '2rem 0' }} />

      {/* 4. O botão que abre o modal (seu código está perfeito) */}
      <button onClick={() => {
        console.log('CLICOU! Mudando estado para true');
        setIsModalOpen(true)}}>
        Abrir Modal de Teste
      </button>

      {/* 5. O seu componente Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        {/* 6. Substituímos seu formulário antigo 
            pelo componente que já tem tudo */}
        <UpdateFormularioRegistro 
          onSave={() => setIsModalOpen(false)} 
        />
        
      </Modal>
    </div>
  );
}

export default PaginaTesteModal;