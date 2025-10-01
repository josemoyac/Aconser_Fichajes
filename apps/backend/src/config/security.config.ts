export default () => ({
  rateLimit: {
    ttl: Number(process.env.RATE_LIMIT_WINDOW ?? 60),
    limit: Number(process.env.RATE_LIMIT_MAX ?? 100)
  }
});
