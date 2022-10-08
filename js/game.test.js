import Game from "./game.js"
import random from 'random'
import seedrandom from 'seedrandom'

beforeEach(() => {
    const rng = random.clone('footbored');
    // random.use(seedrandom('footbored'));
    rng.patch();
  });

const testGame = new Game({'name': 'Rams', 'city': 'Los Angeles', 'abrv': 'LAR'},
{'name': 'Steelers', 'city': 'Pittsburgh', 'abrv': 'PIT'}, 'reg', 1, 1, 2)

describe('simple functions', () => {
    it('some test, not sure yet', () => {
        expect(testGame.away).toBe(1);
    })
})