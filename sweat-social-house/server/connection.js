export function connectionString(value) {
  if(!value)throw new Error('Database unavailable');
  const url=new URL(value);
  // Require certificate and hostname verification, including after a pg upgrade.
  url.searchParams.set('sslmode','verify-full');
  url.searchParams.delete('uselibpqcompat');
  return url.toString();
}
