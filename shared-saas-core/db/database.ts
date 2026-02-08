import { Knex, knex } from 'knex';
import pg from 'pg';

const createConnection = (): Knex => {
  pg.defaults.ssl = process.env.DB_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : false;

  const config: Knex.Config = {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'app_db',
      ssl: process.env.DB_SSL === 'true' 
        ? { rejectUnauthorized: false } 
        : false,
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 60000,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    debug: process.env.DB_DEBUG === 'true',
  };

  return knex(config);
};

let connection: Knex | null = null;

export const getDatabase = (): Knex => {
  if (!connection) {
    connection = createConnection();
  }
  return connection;
};

export const closeDatabase = async (): Promise<void> => {
  if (connection) {
    await connection.destroy();
    connection = null;
  }
};

export const runMigrations = async (): Promise<void> => {
  const db = getDatabase();
  await db.migrate.latest();
};

export const runSeeds = async (): Promise<void> => {
  const db = getDatabase();
  await db.seed.run();
};

export interface Migration {
  id: string;
  name: string;
  timestamp: Date;
}

export const createMigration = async (name: string): Promise<void> => {
  const db = getDatabase();
  await db.migrate.make(name);
};

export const rollbackMigration = async (): Promise<void> => {
  const db = getDatabase();
  await db.migrate.rollback();
};

export const transaction = async <T>(
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => {
  const db = getDatabase();
  return db.transaction(callback);
};

export type Database = ReturnType<typeof getDatabase>;
