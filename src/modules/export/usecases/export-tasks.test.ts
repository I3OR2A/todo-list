import { describe, expect, it, vi } from 'vitest';

import { buildExportPayload } from '@/modules/export/utils/build-export-payload';

describe('export-tasks payload assembly', () => {
  it('builds a schema-versioned payload and filters child rows by exported task ids', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-21T10:00:00.000Z'));

    const payload = buildExportPayload({
      categories: [
        {
          color: '#ff6b6b',
          createdAt: '2026-03-20T10:00:00.000Z',
          icon: '🏠',
          id: 'cat_home',
          name: 'Home',
          sortOrder: 1,
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
      ],
      exportType: 'all',
      reminders: [
        {
          createdAt: '2026-03-20T10:00:00.000Z',
          id: 'rem_1',
          notificationRequestId: null,
          remindAt: '2026-03-21T09:00:00.000Z',
          reminderType: 'normal',
          taskId: 'task_1',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
        {
          createdAt: '2026-03-20T10:00:00.000Z',
          id: 'rem_2',
          notificationRequestId: null,
          remindAt: '2026-03-21T09:00:00.000Z',
          reminderType: 'normal',
          taskId: 'task_2',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
      ],
      settings: {
        dailySummaryEnabled: false,
        dailySummaryTime: null,
        defaultReminderJson: null,
        defaultSort: 'dueAt',
        id: 'default',
        notificationsEnabled: true,
        onboardingCompleted: true,
        themeMode: 'system',
        updatedAt: '2026-03-20T10:00:00.000Z',
      },
      subTasks: [
        {
          createdAt: '2026-03-20T10:00:00.000Z',
          id: 'sub_1',
          isCompleted: false,
          taskId: 'task_1',
          title: 'Buy milk',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
      ],
      tasks: [
        {
          categoryId: 'cat_home',
          completedAt: null,
          createdAt: '2026-03-20T10:00:00.000Z',
          deletedAt: null,
          dueAt: '2026-03-21T10:00:00.000Z',
          id: 'task_1',
          isRecurring: false,
          note: 'Whole milk',
          parentTaskId: null,
          priority: 'medium',
          recurrenceGenerateMode: null,
          recurrenceInterval: null,
          recurrenceType: null,
          status: 'active',
          title: 'Buy milk',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
      ],
    });

    expect(payload.schema_version).toBe('1.0.0');
    expect(payload.exported_at).toBe('2026-03-21T10:00:00.000Z');
    expect(payload.tasks).toHaveLength(1);
    expect(payload.task_sub_items).toHaveLength(1);
    expect(payload.task_reminders).toHaveLength(1);
    expect(payload.task_reminders[0]?.task_id).toBe('task_1');

    vi.useRealTimers();
  });
});
