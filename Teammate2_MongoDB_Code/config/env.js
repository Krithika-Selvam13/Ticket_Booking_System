function validateEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variable(s): ${missing.join(', ')}`);
  if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes long');
  }
  if (process.env.NODE_ENV === 'production' &&
      (!process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGIN.includes('*'))) {
    throw new Error('Set CLIENT_ORIGIN to an explicit origin in production');
  }
}
module.exports = { validateEnv };
