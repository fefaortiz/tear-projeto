import React, { useState } from 'react';
import { X, Smile, Frown, Meh, Angry, type LucideIcon } from 'lucide-react';

interface MoodOption {
  label: string;
  icon: LucideIcon;
  color: string;
}

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mood: string) => void;
}

export const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodOptions: MoodOption[] = [
    { label: 'Feliz', icon: Smile, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { label: 'Neutro', icon: Meh, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { label: 'Triste', icon: Frown, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { label: 'Estressado', icon: Angry, color: 'bg-rose-100 text-rose-600 border-rose-200' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Como você está hoje?</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {moodOptions.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                selectedMood === mood.label 
                  ? 'border-slate-800 ring-1 ring-slate-800 bg-slate-50' 
                  : 'border-transparent hover:bg-slate-50'
              } ${mood.color}`}
            >
              <mood.icon size={32} />
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => selectedMood && onSave(selectedMood)}
          disabled={!selectedMood}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            selectedMood 
              ? 'bg-slate-900 text-white hover:bg-slate-800' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Salvar Registro
        </button>
      </div>
    </div>
  );
};