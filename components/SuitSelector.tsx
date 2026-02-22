
import React from 'react';
import { Suit, Language } from '../types';
import { SUIT_ICONS, SUITS, TRANSLATIONS } from '../constants';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
  language: Language;
}

const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, language }) => {
  const t = TRANSLATIONS[language];

  const getSuitName = (suit: Suit) => {
    switch (suit) {
      case Suit.HEARTS: return t.hearts;
      case Suit.DIAMONDS: return t.diamonds;
      case Suit.CLUBS: return t.clubs;
      case Suit.SPADES: return t.spades;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.selectSuit}</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <span className="text-4xl group-hover:scale-125 transition-transform">{SUIT_ICONS[suit]}</span>
              <span className="text-lg font-semibold text-gray-700">
                {getSuitName(suit)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuitSelector;
