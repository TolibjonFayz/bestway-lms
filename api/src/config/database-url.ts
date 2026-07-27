export interface DatabaseCredentials {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

/* Railway (and most hosts) hand out one connection string rather than five
   separate variables. Accepting it avoids transcription mistakes — but only
   the PUBLIC url works from a laptop; the *.railway.internal one resolves
   inside their network only. */
export function parseDatabaseUrl(url: string): DatabaseCredentials {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (!/^postgres(ql)?:$/.test(parsed.protocol)) {
    throw new Error(
      `DATABASE_URL must start with postgresql:// (got "${parsed.protocol}//").`,
    );
  }

  const name = parsed.pathname.replace(/^\//, '');
  if (!name) {
    throw new Error('DATABASE_URL is missing the database name after the host.');
  }

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    name,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

/** Managed Postgres is almost always TLS-only; localhost almost never is. */
export function sslDefaultForHost(host: string): boolean {
  return !['localhost', '127.0.0.1', '::1'].includes(host);
}
