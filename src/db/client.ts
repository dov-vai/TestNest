import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/testnest';

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle({ client: pool, schema });

export type DB = typeof db;
