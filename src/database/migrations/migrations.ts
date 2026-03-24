import { INITIAL_SCHEMA_SQL } from '@/database/schema/schema.sql';

export type DatabaseMigration = {
  version: number;
  name: string;
  sql: string;
};

export const DATABASE_MIGRATIONS: DatabaseMigration[] = [
  {
    version: 1,
    name: 'initial_schema',
    sql: INITIAL_SCHEMA_SQL,
  },
];
