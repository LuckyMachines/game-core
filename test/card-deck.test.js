import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

const deckKeys = [
  'EVENT_DECK',
  'AMBUSH_DECK',
  'TREASURE_DECK',
  'LAND_DECK',
  'RELIC_DECK',
];

describe('Card Decks', () => {
  for (const key of deckKeys) {
    const label = key.replace('_', ' ').toLowerCase();

    describe(key, () => {
      const deck = getContractInstance(key);

      it(`getDeck() returns non-empty array`, async () => {
        const cards = await deck.read.getDeck();
        expect(cards.length).toBeGreaterThan(0);
      });

      it(`getDescription(firstCard) does not revert`, async () => {
        const cards = await deck.read.getDeck();
        const description = await deck.read.getDescription([cards[0]]);
        expect(typeof description).toBe('string');
      });
    });
  }
});
