import React, { useEffect, useState } from 'react';

interface MediaDiariaProps {
  pacienteId: number;
}

const MediaDiariaCard: React.FC<MediaDiariaProps> = ({ pacienteId }) => {
  const [media, setMedia] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchMediaHoje = async () => {
      try {
        const token = localStorage.getItem('token'); // 1. Pegar o token
        
        const response = await fetch(`http://localhost:3333/api/tracking/media-diaria/${pacienteId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. Enviar no cabeçalho
          }
        });

        if (!response.ok) throw new Error('Falha ao buscar média');

        const data = await response.json();
        setMedia(data.media);
      } catch (error) {
        console.error("Erro ao carregar média:", error);
      } finally {
        setLoading(false);
      }
    };

    // Só executa se tiver um pacienteId válido
    if (pacienteId) {
        fetchMediaHoje();
    }
  }, [pacienteId]);

  // Função para determinar a cor e o texto de feedback
  const getFeedback = (val: number) => {
    if (val <= 2) return { color: 'text-green-500', text: 'Dia tranquilo' };
    if (val <= 3.5) return { color: 'text-yellow-500', text: 'Dia moderado' };
    return { color: 'text-red-500', text: 'Dia intenso' };
  };

  const feedback = media ? getFeedback(media) : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xs border border-gray-100 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
        Bem-Estar Hoje
      </h3>
      
      {loading ? (
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      ) : media !== null ? (
        <>
          {/* Exibe o Número Grande */}
          <div className="flex items-end justify-center mb-2">
            <span className={`text-6xl font-extrabold ${feedback?.color}`}>
              {media.toFixed(1)}
            </span>
            <span className="text-gray-400 text-xl font-medium mb-1 ml-1">/5</span>
          </div>

          {/* Exibe Feedback em texto (ex: "Dia tranquilo") */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-50 ${feedback?.color}`}>
            {feedback?.text}
          </span>
          
          <p className="text-xs text-gray-400 mt-4">
            Baseado nos seus registos de hoje.
          </p>
        </>
      ) : (
        /* Estado Vazio: Se não houver registros hoje */
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-gray-300 text-5xl mb-2 font-light">--</span>
          <p className="text-sm text-gray-500 font-medium">Nenhum registo hoje</p>
          <p className="text-xs text-gray-400 mt-1">
            Que tal registar como se sente?
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaDiariaCard;