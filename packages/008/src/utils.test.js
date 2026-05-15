import { cleanPhoneNumber, genId, sleep } from './utils';

describe('cleanPhoneNumber', () => {
  it('strips spaces and parentheses', () => {
    expect(cleanPhoneNumber('+34 (917) 370 224')).toBe('+34917370224');
  });

  it('keeps dashes and other characters intact', () => {
    expect(cleanPhoneNumber('+1-555-0100')).toBe('+1-555-0100');
  });
});

describe('genId', () => {
  it('produces a string with a timestamp and a random suffix', () => {
    const id = genId();
    expect(id).toMatch(/^\d+\.\d{6}$/);
  });

  it('returns unique values when called in quick succession', () => {
    const ids = new Set(Array.from({ length: 50 }, () => genId()));
    expect(ids.size).toBe(50);
  });
});

describe('sleep', () => {
  it('resolves after roughly the requested seconds', async () => {
    jest.useFakeTimers();
    const promise = sleep(2);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});
