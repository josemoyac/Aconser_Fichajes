export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-secret',
  timezone: 'Europe/Madrid'
});
