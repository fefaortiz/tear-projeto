import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const StatsGrid: React.FC = () => {
  const [moodHistory, setMoodHistory] = useState<string[]>([]);

  useEffect(() => {
    const data: string[] = [];
    const colors = [
      'bg-slate-100', // Vazio
      'bg-blue-400',  // Humor 1
      'bg-yellow-400',// Humor 2
      'bg-rose-400',  // Humor 3
      'bg-teal-400',  // Humor 4
    ];

    for (let i = 0; i < 364; i++) {
      const isEmpty = Math.random() > 0.15; 
      if (isEmpty) {
        data.push(colors[0]);
      } else {
        const randomColorIndex = Math.floor(Math.random() * (colors.length - 1)) + 1;
        data.push(colors[randomColorIndex]);
      }
    }
    setMoodHistory(data);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Stats</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition shadow-sm">
          <span>Year</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 h-48 w-full">
            {moodHistory.map((colorClass, index) => (
              <div 
                key={index} 
                className={`w-full h-full rounded-sm ${colorClass} hover:opacity-80 transition cursor-pointer`}
                title={`Dia ${index + 1}`}
              ></div>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-4 mt-4 text-sm text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-teal-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};