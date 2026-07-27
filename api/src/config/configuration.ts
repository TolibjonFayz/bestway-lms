import { parseDatabaseUrl, sslDefaultForHost } from './database-url';

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  bcryptRounds: number;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    logging: boolean;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  seedPassword: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy api/.env.example to api/.env and fill it in.`,
    );
  }
  return value;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/* DATABASE_URL wins when present — one pasted connection string beats five
   hand-copied variables. */
function credentials(): {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
} {
  if (process.env.DATABASE_URL) {
    return parseDatabaseUrl(process.env.DATABASE_URL);
  }
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: toNumber(process.env.DB_PORT, 5432),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
  };
}

export default (): AppConfig => {
  const jwtAccessSecret = required('JWT_ACCESS_SECRET');
  const jwtRefreshSecret = required('JWT_REFRESH_SECRET');

  /* Reusing one secret for both token kinds means a stolen access token can be
     replayed as a refresh token, so refuse to boot on it. */
  if (jwtAccessSecret === jwtRefreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ.');
  }

  return {
    env: process.env.NODE_ENV ?? 'development',
    port: toNumber(process.env.PORT, 3000),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5190')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 12),
    database: {
      ...credentials(),
      ssl: toBoolean(process.env.DB_SSL, sslDefaultForHost(credentials().host)),
      logging: toBoolean(process.env.DB_LOGGING, false),
    },
    jwt: {
      accessSecret: jwtAccessSecret,
      refreshSecret: jwtRefreshSecret,
      accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
      refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
    },
    seedPassword: process.env.SEED_PASSWORD ?? 'bestway123',
  };
};
