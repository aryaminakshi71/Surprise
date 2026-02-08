import knex, { Knex } from 'knex';
import pg from 'pg';

const configurePg = () => {
  pg.defaults.ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
};

let connection: Knex | null = null;

export const getDatabaseConnection = (): Knex => {
  if (connection) {
    return connection;
  }

  configurePg();

  const config: Knex.Config = {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'app_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  };

  connection = knex(config);

  return connection;
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (connection) {
    await connection.destroy();
    connection = null;
  }
};

export type DatabaseConnection = Knex;
