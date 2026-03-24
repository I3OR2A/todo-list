import { type SQLiteDatabase } from 'expo-sqlite';

import { type HomeTaskSection } from '@/modules/task/domain/task-detail.types';
import { type HomeViewType } from '@/modules/task/domain/task.types';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { refreshTaskStatuses } from '@/modules/task/usecases/refresh-task-statuses';

export async function listHomeTasks(
  database: SQLiteDatabase,
  view: HomeViewType
): Promise<HomeTaskSection[]> {
  const taskRepository = new SQLiteTaskRepository(database);
  await refreshTaskStatuses(database);
  const items = await taskRepository.getTasksForHomeView(view);

  if (view === 'by_category') {
    const groups = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.categoryName ?? 'Uncategorized';
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }

    return Array.from(groups.entries()).map(([title, groupedItems]) => ({
      title,
      items: groupedItems,
    }));
  }

  if (view === 'by_priority') {
    const priorityOrder: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    return priorityOrder
      .map((priority) => ({
        title: priority.toUpperCase(),
        items: items.filter((item) => item.priority === priority),
      }))
      .filter((section) => section.items.length > 0);
  }

  return [
    {
      title: getHomeViewTitle(view),
      items,
    },
  ];
}

function getHomeViewTitle(view: HomeViewType) {
  switch (view) {
    case 'today':
      return 'Today';
    case 'upcoming':
      return 'Upcoming';
    case 'overdue':
      return 'Overdue';
    case 'all':
    default:
      return 'All Tasks';
  }
}
