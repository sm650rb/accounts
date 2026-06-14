export function appBaseUrl(): string {
  return (process.env.APP_URL ?? 'http://localhost:5174').replace(/\/$/, '');
}
