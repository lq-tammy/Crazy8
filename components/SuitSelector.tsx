
import React from 'react';
import { Suit } from '../types';
import { SUIT_ICONS, SUITS } from '../constants';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">选择下一个花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <span className="text-4xl group-hover:scale-125 transition-transform">{SUIT_ICONS[suit]}</span>
              <span className="text-lg font-semibold text-gray-700">
                {suit === Suit.HEARTS ? '红心' : suit === Suit.DIAMONDS ? '方块' : suit === Suit.CLUBS ? '梅花' : '黑桃'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuitSelector;
