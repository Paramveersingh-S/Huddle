import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This defaults to a local connection string if not defined
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
