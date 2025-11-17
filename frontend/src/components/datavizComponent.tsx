import React from 'react';

// --- Types ---
// Definindo os tipos para os props dos componentes

// Props para os ícones
interface IconProps {
  className: string;
}

// Props para o Card
interface InfoCardProps {
  icon: React.ComponentType<IconProps>; // O ícone é um componente React que aceita 'className'
  title: string;
  text: string;
  rotation: string;
  colorClass: string;
}

// --- Card Component ---
// Adicionamos 'React.FC<InfoCardProps>' para tipar os props
const InfoCard: React.FC<InfoCardProps> = ({ icon, title, text, rotation, colorClass }) => {
  // O ícone é passado como um componente JSX
  const IconComponent = icon;

  return (
    <div 
      className={`
        bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-5 
        transform ${rotation} transition-transform hover:rotate-0 hover:scale-105 
        duration-300 ease-in-out w-full max-w-sm mx-auto mb-6
      `}
    >
      <div className="flex-shrink-0">
        <IconComponent className={`h-10 w-10 ${colorClass}`} />
      </div>
      <div>
        <h2 className="text-gray-800 text-lg font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );
};

// --- Icon Components ---
// Adicionamos 'React.FC<IconProps>' para tipar o prop 'className'

const IconGrafico: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconBalao: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconCoracao: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);


// --- Main App Component ---
// Adicionamos 'React.FC' (Functional Component)
const dataVizComponent: React.FC = () => {
  // A fonte 'Inter' deve ser importada no seu arquivo CSS global ou no index.html.
  // Aqui, aplicamos as classes do body original ao container principal.
  
  // O style inline precisa de tipagem em TS. 'React.CSSProperties' é o tipo correto.
  const bodyStyle: React.CSSProperties = { 
    fontFamily: "'Inter', sans-serif" 
  };
  
  const animationDelayStyle: React.CSSProperties = { 
    animationDelay: '2s' 
  };

  return (
    <div className="bg-gray flex items-center justify-center p-6 overflow-hidden" style={bodyStyle}>
      
      {/* Container principal que centraliza o conteúdo */}
      <div className="relative w-full max-w-md">

        {/* Elemento 1: Círculo de fundo suave (Vibe da ilustração original) */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl animate-pulse"></div>
        
        {/* Elemento 2: Outro círculo de fundo suave */}
        <div 
          className="absolute bottom-0 -right-20 w-80 h-80 bg-teal-100 rounded-full opacity-40 blur-3xl animate-pulse" 
          style={animationDelayStyle}
        ></div>

        {/* Container para os cards, 'relative' para ficar acima dos círculos */}
        <div className="relative z-10">

            {/* Usando o componente InfoCard reutilizável */}
            <InfoCard 
              icon={IconGrafico}
              title="Estimativa Nacional"
              text="Cerca de 2 milhões de brasileiros."
              rotation="-rotate-2"
              colorClass="text-blue-500"
            />
            
            <InfoCard 
              icon={IconBalao}
              title="Diagnóstico Precoce"
              text="Fundamental para o desenvolvimento."
              rotation="rotate-1"
              colorClass="text-teal-500"
            />

            <InfoCard 
              icon={IconCoracao}
              title="Conscientização"
              text="Abril Azul: Mês da visibilidade."
              rotation="-rotate-1"
              colorClass="text-indigo-500"
            />

        </div>
      </div>
    </div>
  );
}

export default dataVizComponent;