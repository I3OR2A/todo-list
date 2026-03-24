import { describe, expect, it } from 'vitest';

import { shouldCatchUpRecurringTask } from '@/modules/task/usecases/catch-up-recurring-task.utils';

describe('catch-up-recurring-tasks', () => {
  it('requires overdue recurring tasks to generate follow-up instances', () => {
    expect(
      shouldCatchUpRecurringTask(
        {
          id: 'task_1',
          title: 'Water plants',
          dueAt: '2026-03-20T10:00:00.000Z',
          priority: 'medium',
          status: 'overdue',
          isRecurring: true,
          recurrenceType: 'daily',
          recurrenceInterval: 1,
          recurrenceGenerateMode: 'after_completion',
          createdAt: '2026-03-19T10:00:00.000Z',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
        new Date('2026-03-21T10:00:00.000Z').getTime()
      )
    ).toBe(true);
  });

  it('skips non-recurring and completed tasks', () => {
    const referenceTime = new Date('2026-03-21T10:00:00.000Z').getTime();

    expect(
      shouldCatchUpRecurringTask(
        {
          id: 'task_2',
          title: 'One-off',
          dueAt: '2026-03-20T10:00:00.000Z',
          priority: 'medium',
          status: 'overdue',
          isRecurring: false,
          createdAt: '2026-03-19T10:00:00.000Z',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
        referenceTime
      )
    ).toBe(false);

    expect(
      shouldCatchUpRecurringTask(
        {
          id: 'task_3',
          title: 'Already done',
          dueAt: '2026-03-20T10:00:00.000Z',
          priority: 'medium',
          status: 'completed',
          isRecurring: true,
          recurrenceType: 'daily',
          recurrenceInterval: 1,
          recurrenceGenerateMode: 'after_completion',
          completedAt: '2026-03-20T12:00:00.000Z',
          createdAt: '2026-03-19T10:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
        referenceTime
      )
    ).toBe(false);
  });
});
