
import React from 'react';
import { Masseuse } from '../types';

interface MasseuseSelectorProps {
  masseuses: Masseuse[];
  selectedMasseuseId: string;
  onSelect: (id: string) => void;
}

export const MasseuseSelector: React.FC<MasseuseSelectorProps> = ({ masseuses, selectedMasseuseId, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-slate-700">마사지사 선택</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {masseuses.map(masseuse => (
          <button
            key={masseuse.id}
            onClick={() => onSelect(masseuse.id)}
            className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${selectedMasseuseId === masseuse.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-400'}`}
          >
            <img src={masseuse.imageUrl} alt={masseuse.name} className="w-20 h-20 rounded-full mx-auto mb-2" />
            <p className="font-semibold text-slate-800">{masseuse.name}</p>
            <p className="text-sm text-slate-500">{masseuse.specialty}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
