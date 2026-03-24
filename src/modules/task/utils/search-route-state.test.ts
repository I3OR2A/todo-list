import { describe, expect, it } from 'vitest';

import {
  parseSearchRouteState,
  serializeSearchRouteState,
  toggleArrayValue,
} from '@/modules/task/utils/search-route-state';

describe('search-route-state', () => {
  it('round-trips route params into normalized search state', () => {
    const state = parseSearchRouteState({
      categoryIds: 'cat_home,__uncategorized__',
      dateFrom: '2026-03-21',
      dateTo: '2026-03-25',
      hasReminder: 'true',
      isRecurring: 'false',
      keyword: 'milk',
      priority: 'high,low',
      sortBy: 'priority',
      sortOrder: 'desc',
      statuses: 'active,completed',
    });

    expect(serializeSearchRouteState(state)).toEqual({
      categoryIds: 'cat_home,__uncategorized__',
      dateFrom: '2026-03-21',
      dateTo: '2026-03-25',
      hasReminder: 'true',
      isRecurring: 'false',
      keyword: 'milk',
      priority: 'high,low',
      sortBy: 'priority',
      sortOrder: 'desc',
      statuses: 'active,completed',
    });
  });

  it('toggles repeated values predictably', () => {
    expect(toggleArrayValue(['high', 'low'], 'high')).toEqual(['low']);
    expect(toggleArrayValue(['high'], 'medium')).toEqual(['high', 'medium']);
  });
});
