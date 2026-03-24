const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const REMINDER_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/;

export function combineDateAndTime(date: string, time: string) {
  if (!DATE_PATTERN.test(date.trim()) || !TIME_PATTERN.test(time.trim())) {
    return null;
  }

  const normalized = `${date.trim()}T${time.trim()}:00`;
  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

export function parseReminderInput(value: string) {
  const trimmedValue = value.trim();

  if (!REMINDER_PATTERN.test(trimmedValue)) {
    return null;
  }

  const normalized = trimmedValue.replace(' ', 'T');
  const parsedDate = new Date(`${normalized}:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

export function splitIsoToDateTime(isoValue: string) {
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    date: formatDate(parsedDate),
    time: formatTime(parsedDate),
  };
}

export function formatTaskDateTime(isoValue: string) {
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return isoValue;
  }

  return `${formatDate(parsedDate)} ${formatTime(parsedDate)}`;
}

export function createDefaultDueAtParts() {
  const nextHour = new Date();
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);

  return {
    dueDate: formatDate(nextHour),
    dueTime: formatTime(nextHour),
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${hours}:${minutes}`;
}
