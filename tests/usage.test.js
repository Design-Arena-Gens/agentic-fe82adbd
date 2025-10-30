import { describe, expect, it } from 'vitest';
import { calculateUsageStats, formatClock, formatDuration } from '@/lib/usage';

describe('usage helpers', () => {
  it('calculates stats for partially completed reels', () => {
    const stats = calculateUsageStats({
      sessionLengthSeconds: 75,
      completedCount: 4,
      totalSessions: 10
    });

    expect(stats).toEqual({
      consumedSeconds: 300,
      remainingSeconds: 450,
      percentComplete: 40
    });
  });

  it('formats durations into human readable labels', () => {
    expect(formatDuration(3600 + 120)).toBe('1 hour 2 minutes');
    expect(formatDuration(45)).toBe('45 seconds');
  });

  it('formats clock strings as mm:ss', () => {
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(5)).toBe('00:05');
  });
});
