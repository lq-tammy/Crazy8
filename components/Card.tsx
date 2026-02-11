
import React from 'react';
import { CardType, Rank } from '../types';
import { SUIT_ICONS, SUIT_COLORS } from '../constants';

interface CardProps {
  card: CardType;
  hidden?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ card, hidden, onClick, disabled, highlighted }) => {
  if (hidden) {
    return (
      <div 
        className="w-16 h-24 md:w-24 md:h-36 bg-blue-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center transform transition-transform hover:-translate-y-2 cursor-default relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-1 p-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-xs text-white">♠</div>
          ))}
        </div>
        <div className="w-10 h-10 md:w-16 md:h-16 border-2 border-blue-300 rounded-full flex items-center justify-center">
            <span className="text-blue-200 text-xl font-bold">8</span>
        </div>
      </div>
    );
  }

  const isRed = SUIT_COLORS[card.suit].includes('red');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-24 md:w-24 md:h-36 bg-white rounded-lg border-2 shadow-xl flex flex-col justify-between p-1 md:p-2 
        transform transition-all duration-200 select-none
        ${disabled ? 'cursor-not-allowed grayscale-[0.2] opacity-90' : 'cursor-pointer hover:-translate-y-4 hover:shadow-2xl active:scale-95'}
        ${highlighted ? 'border-yellow-400 ring-4 ring-yellow-400/50 scale-105 z-10' : 'border-gray-200'}
      `}
    >
      <div className="flex flex-col items-start leading-none">
        <span className={`text-sm md:text-xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
        <span className="text-xs md:text-lg">{SUIT_ICONS[card.suit]}</span>
      </div>
      
      <div className="flex justify-center items-center text-3xl md:text-5xl">
        {SUIT_ICONS[card.suit]}
      </div>

      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`text-sm md:text-xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
        <span className="text-xs md:text-lg">{SUIT_ICONS[card.suit]}</span>
      </div>
    </button>
  );
};

export default Card;
