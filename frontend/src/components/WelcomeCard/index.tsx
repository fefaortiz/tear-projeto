import React from 'react';

interface WelcomeCardProps {
  userName: string;
  onAddMood: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, onAddMood }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Hey, {userName} <span className="animate-wave">👋</span>
      </h1>
      <p className="text-slate-500 text-lg mb-8">How is your day going?</p>
      
      <button 
        onClick={onAddMood}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Add Mood to calendar
      </button>
    </div>
  );
};