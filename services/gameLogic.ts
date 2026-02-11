
import { CardType, Suit, Rank } from '../types';
import { SUITS, RANKS } from '../constants';

export const createDeck = (): CardType[] => {
  const deck: CardType[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}-${suit}-${Math.random()}`,
        suit,
        rank,
      });
    });
  });
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: CardType[]): CardType[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const isValidMove = (card: CardType, topCard: CardType, currentSuit: Suit | null): boolean => {
  // 8 is always a valid move (Wildcard)
  if (card.rank === Rank.EIGHT) return true;

  // If the last card was an 8, use the chosen suit
  const suitToMatch = currentSuit || topCard.suit;

  return card.suit === suitToMatch || card.rank === topCard.rank;
};

export const getAIBestMove = (hand: CardType[], topCard: CardType, currentSuit: Suit | null): { card: CardType | null; chosenSuit: Suit | null } => {
  const suitToMatch = currentSuit || topCard.suit;

  // 1. Try to match rank or suit (avoid playing 8 if possible)
  const matches = hand.filter(c => c.rank !== Rank.EIGHT && (c.suit === suitToMatch || c.rank === topCard.rank));
  if (matches.length > 0) {
    return { card: matches[0], chosenSuit: null };
  }

  // 2. Play an 8 if no other matches
  const eight = hand.find(c => c.rank === Rank.EIGHT);
  if (eight) {
    // Pick the suit AI has most of
    const suitCounts: Record<Suit, number> = {
      [Suit.HEARTS]: 0,
      [Suit.DIAMONDS]: 0,
      [Suit.CLUBS]: 0,
      [Suit.SPADES]: 0,
    };
    hand.forEach(c => {
      if (c.rank !== Rank.EIGHT) suitCounts[c.suit]++;
    });
    
    let bestSuit = Suit.HEARTS;
    let max = -1;
    (Object.keys(suitCounts) as Suit[]).forEach(s => {
      if (suitCounts[s] > max) {
        max = suitCounts[s];
        bestSuit = s;
      }
    });

    return { card: eight, chosenSuit: bestSuit };
  }

  return { card: null, chosenSuit: null };
};
