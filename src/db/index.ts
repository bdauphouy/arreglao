import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';
import { tasks } from './schema';

const expoDb = openDatabaseSync('app.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

export function insertTask(title: string) {
  return db.insert(tasks).values({ title }).returning();
}

export function listTasks() {
  return db.select().from(tasks).all();
}
