
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
        className="w-14 h-20 md:w-24 md:h-36 bg-gradient-to-br from-indigo-900 to-blue-950 rounded-lg border-2 border-white/20 shadow-2xl flex items-center justify-center transform transition-transform hover:-translate-y-2 cursor-default relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 flex flex-wrap gap-1 p-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="text-[8px] md:text-xs text-blue-200">♣♠♥♦</div>
          ))}
        </div>
        <div className="w-8 h-8 md:w-16 md:h-16 border-2 border-blue-400/30 rounded-full flex items-center justify-center bg-blue-900/50 backdrop-blur-sm">
            <span className="text-blue-200 text-lg md:text-2xl font-bold">8</span>
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
        w-14 h-20 md:w-24 md:h-36 bg-white rounded-lg border-2 shadow-2xl flex flex-col justify-between p-1 md:p-2 
        transform transition-all duration-300 select-none relative
        ${disabled ? 'cursor-not-allowed opacity-40 grayscale-[0.5]' : 'cursor-pointer hover:-translate-y-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95'}
        ${highlighted ? 'border-yellow-400 ring-4 ring-yellow-400/50 scale-110 z-10 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : 'border-gray-100'}
      `}
    >
      {highlighted && (
        <div className="absolute -inset-1 rounded-lg bg-yellow-400/20 animate-pulse pointer-events-none"></div>
      )}
      
      <div className="flex flex-col items-start leading-none">
        <span className={`text-xs md:text-xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
        <span className="text-[10px] md:text-lg">{SUIT_ICONS[card.suit]}</span>
      </div>
      
      <div className="flex justify-center items-center text-2xl md:text-5xl drop-shadow-sm">
        {SUIT_ICONS[card.suit]}
      </div>

      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`text-xs md:text-xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
        <span className="text-[10px] md:text-lg">{SUIT_ICONS[card.suit]}</span>
      </div>
    </button>
  );
};

export default Card;
