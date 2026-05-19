// Konfigurasi JWT — wajib secret kuat di production
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET wajib di-set di production');
  }

  return 'dev-only-insecure-jwt-secret-change-me';
}

export const jwtExpiresIn = process.env.JWT_EXPIRATION || '7d';
