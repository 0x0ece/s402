import { createS402Fetch } from '../src/wrapper';

describe('Fetch Wrapper', () => {
  test('creates fetch function', () => {
    const s402Fetch = createS402Fetch();
    expect(typeof s402Fetch).toBe('function');
  });
});
