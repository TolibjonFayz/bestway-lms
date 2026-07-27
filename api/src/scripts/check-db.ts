import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { Sequelize } from 'sequelize';
import configuration from '@/config/configuration';

loadEnv();

/* Setting up a hosted database is where this project is most likely to stall,
   so say plainly what is wrong instead of surfacing a raw driver error. */
const DIAGNOSES: { test: (message: string) => boolean; hint: string }[] = [
  {
    test: (m) => m.includes('ENOTFOUND') || m.includes('EAI_AGAIN'),
    hint:
      'Host not found. On Railway this usually means you copied DATABASE_URL\n' +
      '  (which points at *.railway.internal and only resolves inside their\n' +
      '  network). Use DATABASE_PUBLIC_URL instead — the *.proxy.rlwy.net one.',
  },
  {
    test: (m) => m.includes('ECONNREFUSED'),
    hint:
      'Nothing is listening on that host and port. If this is a local server,\n' +
      '  check the PostgreSQL service is running; if hosted, check the port.',
  },
  {
    test: (m) => m.includes('password authentication failed'),
    hint: 'Wrong user or password. Re-copy the credentials from your provider.',
  },
  {
    test: (m) => m.includes('does not exist'),
    hint:
      'The database name is wrong. Railway calls it "railway", not\n' +
      '  "bestway_lms". For a local server run: npm run db:create',
  },
  {
    test: (m) => m.includes('SSL') || m.includes('ssl'),
    hint: 'TLS mismatch — try setting DB_SSL=true (hosted) or DB_SSL=false (local).',
  },
  {
    test: (m) => m.includes('ETIMEDOUT'),
    hint: 'Connection timed out. A firewall or VPN may be blocking the port.',
  },
];

async function main(): Promise<void> {
  const { database } = configuration();
  const target = `${database.user}@${database.host}:${database.port}/${database.name}`;
  process.stdout.write(`Connecting to ${target} (ssl: ${database.ssl})…\n`);

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: database.host,
    port: database.port,
    database: database.name,
    username: database.user,
    password: database.password,
    logging: false,
    dialectOptions: database.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  });

  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT version();');
    const version = (rows as { version: string }[])[0]?.version ?? 'unknown';
    process.stdout.write(`OK — ${version}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`FAILED — ${message}\n`);
    const diagnosis = DIAGNOSES.find((d) => d.test(message));
    if (diagnosis) process.stderr.write(`\n  ${diagnosis.hint}\n`);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

void main();
