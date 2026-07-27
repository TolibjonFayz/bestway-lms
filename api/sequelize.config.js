/* sequelize-cli reads this for `npm run migrate`. The Nest app builds the same
   connection in src/config/configuration.ts — keep the two in step. */
require('dotenv').config();

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

function credentials() {
  /* DATABASE_URL wins when present — one pasted connection string beats five
     hand-copied variables. */
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      database: url.pathname.replace(/^\//, ''),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

const base = credentials();
const ssl =
  process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
    : !LOCAL_HOSTS.includes(base.host);

const shared = {
  ...base,
  dialect: 'postgres',
  /* Managed Postgres presents a certificate we have no CA for; the connection
     is still encrypted, we just do not verify the chain. */
  dialectOptions: ssl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  /* Migrations own the schema — synchronize is never enabled anywhere. */
  migrationStorageTableName: 'sequelize_meta',
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
