import { type SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_MIGRATIONS } from '@/database/migrations/migrations';

type UserVersionRow = {
  user_version: number;
};

export async function runMigrations(database: SQLiteDatabase) {
  const row = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version;');
  const currentVersion = row?.user_version ?? 0;

  const pendingMigrations = DATABASE_MIGRATIONS.filter(
    (migration) => migration.version > currentVersion
  ).sort((left, right) => left.version - right.version);

  if (pendingMigrations.length === 0) {
    return;
  }

  for (const migration of pendingMigrations) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(migration.sql);
      await database.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }
}
