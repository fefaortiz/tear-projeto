// src/componentes/IntensityRating/index.tsx
import React, { useState } from 'react';
import './IntensityRating.css'; // Vamos criar este CSS

// 1. Define as opções
const ratings = [
  { label: 'Ameno', value: 1, color: '#a9d6e5' }, // Azul claro
  { label: 'Fraco', value: 2, color: '#76c893' },      // Verde
  { label: 'Normal', value: 3, color: '#fde74c' },     // Amarelo
  { label: 'Forte', value: 4, color: '#f5a623' },    // Laranja
  { label: 'Intenso', value: 5, color: '#d90429' } // Vermelho
];

// 2. Define as props (para que ele possa se comunicar com o formulário)
interface IntensityRatingProps {
  // Uma função para enviar o valor selecionado de volta para o pai
  onChange: (value: number) => void; 
}

const IntensityRating: React.FC<IntensityRatingProps> = ({ onChange }) => {
  // 3. Estado para controlar qual bolinha está selecionada
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleClick = (value: number) => {
    setSelectedValue(value);
    onChange(value); // Envia o valor para o componente pai (o formulário)
  };

  return (
    <div className="intensity-rating-container">
      {ratings.map((rating) => (
        <button
          type="button" // Impede que o botão envie o formulário
          key={rating.value}
          // 4. Lógica do Destaque (Highlight)
          className={`rating-option ${selectedValue === rating.value ? 'selected' : ''}`}
          onClick={() => handleClick(rating.value)}
        >
          {/* 5. A Bolinha (com a cor gradiente) */}
          <div 
            className="rating-circle" 
            style={{ backgroundColor: rating.color }}
          ></div>

          {/* 6. O Label */}
          <span className="rating-label">{rating.label}</span>
        </button>
      ))}
    </div>
  );
};

export default IntensityRating;