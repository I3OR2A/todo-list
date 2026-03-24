import { describe, expect, it } from 'vitest';

import { calculateNextDueAt, shiftReminder } from '@/modules/task/usecases/generate-next-recurring-task';

describe('generate-next-recurring-task helpers', () => {
  it('calculates the next due date for custom weekly recurrence', () => {
    const nextDueAt = calculateNextDueAt(
      '2026-03-21T10:00:00.000Z',
      'custom_weeks',
      2
    );

    expect(nextDueAt).toBe('2026-04-04T10:00:00.000Z');
  });

  it('shifts reminder timestamps by the same delta as dueAt', () => {
    const shifted = shiftReminder(
      '2026-03-21T09:30:00.000Z',
      '2026-03-21T10:00:00.000Z',
      '2026-03-28T10:00:00.000Z'
    );

    expect(shifted).toBe('2026-03-28T09:30:00.000Z');
  });
});
