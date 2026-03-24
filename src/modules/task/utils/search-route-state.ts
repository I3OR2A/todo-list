import { type Priority, type TaskSearchQuery, type TaskStatus } from '@/modules/task/domain/task.types';

export type SearchFormState = {
  categoryIds: string[];
  dateFrom: string;
  dateTo: string;
  hasReminder: boolean | null;
  isRecurring: boolean | null;
  keyword: string;
  priority: Priority[];
  sortBy: NonNullable<TaskSearchQuery['sortBy']>;
  sortOrder: NonNullable<TaskSearchQuery['sortOrder']>;
  statuses: TaskStatus[];
};

export const STATUS_OPTIONS: TaskStatus[] = ['active', 'overdue', 'completed'];
export const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low'];
export const SORT_OPTIONS: { label: string; value: NonNullable<TaskSearchQuery['sortBy']> }[] = [
  { label: 'Due time', value: 'dueAt' },
  { label: 'Created time', value: 'createdAt' },
  { label: 'Updated time', value: 'updatedAt' },
  { label: 'Priority', value: 'priority' },
  { label: 'Category', value: 'category' },
];
export const UNCATEGORIZED_FILTER_ID = '__uncategorized__';

export function createInitialSearchState(
  sortBy: NonNullable<TaskSearchQuery['sortBy']> = 'dueAt'
): SearchFormState {
  return {
    categoryIds: [],
    dateFrom: '',
    dateTo: '',
    hasReminder: null,
    isRecurring: null,
    keyword: '',
    priority: [],
    sortBy,
    sortOrder: 'asc',
    statuses: [],
  };
}

export function coerceSortBy(value: string): NonNullable<TaskSearchQuery['sortBy']> {
  switch (value) {
    case 'createdAt':
    case 'updatedAt':
    case 'priority':
    case 'category':
    case 'dueAt':
      return value;
    default:
      return 'dueAt';
  }
}

export function parseSearchRouteState(
  params: Record<string, string | string[] | undefined>,
  defaultSortBy: NonNullable<TaskSearchQuery['sortBy']> = 'dueAt'
): SearchFormState {
  return {
    categoryIds: splitParamValue(params.categoryIds),
    dateFrom: getSingleParam(params.dateFrom),
    dateTo: getSingleParam(params.dateTo),
    hasReminder: parseNullableBoolean(getSingleParam(params.hasReminder)),
    isRecurring: parseNullableBoolean(getSingleParam(params.isRecurring)),
    keyword: getSingleParam(params.keyword),
    priority: splitParamValue(params.priority).filter(isPriority),
    sortBy: coerceSortBy(getSingleParam(params.sortBy) || defaultSortBy),
    sortOrder: getSingleParam(params.sortOrder) === 'desc' ? 'desc' : 'asc',
    statuses: splitParamValue(params.statuses).filter(isTaskStatus),
  };
}

export function serializeSearchRouteState(state: SearchFormState) {
  return {
    categoryIds: joinParamValue(state.categoryIds),
    dateFrom: state.dateFrom || undefined,
    dateTo: state.dateTo || undefined,
    hasReminder: serializeNullableBoolean(state.hasReminder),
    isRecurring: serializeNullableBoolean(state.isRecurring),
    keyword: state.keyword.trim() || undefined,
    priority: joinParamValue(state.priority),
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    statuses: joinParamValue(state.statuses),
  };
}

export function hasActiveAdvancedFilters(state: SearchFormState) {
  return (
    state.categoryIds.length > 0 ||
    state.statuses.length > 0 ||
    state.priority.length > 0 ||
    Boolean(state.dateFrom) ||
    Boolean(state.dateTo) ||
    state.hasReminder !== null ||
    state.isRecurring !== null
  );
}

export function toggleArrayValue<T extends string>(items: T[], nextItem: T) {
  return items.includes(nextItem)
    ? items.filter((item) => item !== nextItem)
    : [...items, nextItem];
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function splitParamValue(value: string | string[] | undefined) {
  const singleValue = getSingleParam(value);

  if (!singleValue) {
    return [];
  }

  return singleValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinParamValue(values: string[]) {
  return values.length > 0 ? values.join(',') : undefined;
}

function parseNullableBoolean(value: string) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
}

function serializeNullableBoolean(value: boolean | null) {
  if (value === null) {
    return undefined;
  }

  return value ? 'true' : 'false';
}

function isTaskStatus(value: string): value is TaskStatus {
  return value === 'active' || value === 'overdue' || value === 'completed' || value === 'trashed';
}

function isPriority(value: string): value is Priority {
  return value === 'high' || value === 'medium' || value === 'low';
}
