import React, { useState } from 'react';
import { Header } from '../../components/HeaderAcom'; 
import { WelcomeCard } from '../../components/WelcomeCard';
import { StatsGrid } from '../../components/StatsGrid';
import { MoodModal } from '../../components/MoodModal';

// Importe o CSS Global no seu index.tsx raiz ou App.tsx
// import '../../styles/global.css'; 

const Home: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSaveMood = (mood: string) => {
    console.log(`Humor salvo: ${mood}`);
    // Lógica de API aqui
    alert("Humor registrado com sucesso!");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans text-slate-800">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        <WelcomeCard 
          userName="Abhinav" 
          onAddMood={() => setShowModal(true)} 
        />
        
        <StatsGrid />
      </main>

      <MoodModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveMood} 
      />
    </div>
  );
};

export default Home;
