
import React from 'react';
import { Suit, Rank } from './types';

export const SUITS: Suit[] = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
export const RANKS: Rank[] = [
  Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
  Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
  Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
];

export const SUIT_ICONS: Record<Suit, React.ReactNode> = {
  [Suit.HEARTS]: <span className="text-red-500">♥</span>,
  [Suit.DIAMONDS]: <span className="text-red-500">♦</span>,
  [Suit.CLUBS]: <span className="text-black">♣</span>,
  [Suit.SPADES]: <span className="text-black">♠</span>,
};

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.HEARTS]: 'text-red-600',
  [Suit.DIAMONDS]: 'text-red-600',
  [Suit.CLUBS]: 'text-gray-900',
  [Suit.SPADES]: 'text-gray-900',
};
