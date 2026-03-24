import { describe, expect, it } from 'vitest';

import { buildCompletionFeedback, formatRecurrenceLabel } from '@/modules/task/domain/recurrence';

describe('recurrence helpers', () => {
  it('formats custom recurrence labels clearly', () => {
    expect(formatRecurrenceLabel('custom_days', 3)).toBe('Every 3 days');
    expect(formatRecurrenceLabel('custom_weeks', 1)).toBe('Every 1 week');
    expect(formatRecurrenceLabel('daily', null)).toBe('Daily');
  });

  it('builds recurring-aware completion feedback', () => {
    expect(
      buildCompletionFeedback({
        nextRecurringTaskId: 'task_2',
        wasRecurring: true,
      })
    ).toBe('Recurring task completed. The next instance was created.');

    expect(
      buildCompletionFeedback({
        nextRecurringTaskId: null,
        wasRecurring: false,
      })
    ).toBe('Task completed.');
  });
});
