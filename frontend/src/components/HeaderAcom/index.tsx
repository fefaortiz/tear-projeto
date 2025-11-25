import React from 'react';
import { User, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-8 py-6 bg-transparent">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
           <Activity className="text-blue-600 w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-500 font-medium">Aura</span>
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};