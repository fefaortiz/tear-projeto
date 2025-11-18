import React, { useState } from 'react';
import '../modal/Form.css'; 
import IntensityRating from '../intensityRating'; 

interface RegistroProps {
  onSave: () => void;
}

const Registro: React.FC<RegistroProps> = ({ onSave }) => {
  
  // 1. Estados para guardar TODOS os valores
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMood, setSelectedMood] = useState(''); // 👈 ADICIONADO DE VOLTA
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3. Agora o log inclui o 'mood'
    console.log({
      date: selectedDate,
      mood: selectedMood, // 👈 ADICIONADO DE VOLTA
      intensity: selectedIntensity,
      notes: notes
    });
    alert('Dados salvos!');
    onSave(); // Fecha o modal
  };

  return (
    <form className="meu-form" onSubmit={handleSubmit}>
      <h2>Como foi seu dia?</h2>

      {/* --- CAMPO DE MOOD --- */}
      {/* 2. ADICIONADO DE VOLTA */}
      <div className="form-group">
        <label htmlFor="notes-area">Mood</label>
        <textarea
          id="notes-area"
          className="form-textarea"
          rows={1}
          placeholder="O que você quer acompanhar?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* --- CAMPO DE NOTAS --- */}
      <div className="form-group">
        <label htmlFor="notes-area">Notas</label>
        <textarea
          id="notes-area"
          className="form-textarea"
          rows={4}
          placeholder="Descreva..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* --- CAMPO DE INTENSIDADE (BOLINHAS) --- */}
      <div className="form-group">
        <label>Intensidade</label>
        <IntensityRating 
          onChange={(value) => setSelectedIntensity(value)}
        />
      </div>

      <button type="submit" className="form-submit-btn">
        Salvar
      </button>
    </form>
  );
};

export default Registro;