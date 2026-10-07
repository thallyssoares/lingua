import { describe, it, expect } from 'vitest';
import { isNewer } from './appUpdate';

describe('appUpdate', () => {
  it('detecta versão maior', () => {
    expect(isNewer(7, 6)).toBe(true);
  });
  it('ignora mesma versão ou menor', () => {
    expect(isNewer(6, 6)).toBe(false);
    expect(isNewer(5, 6)).toBe(false);
  });
});
