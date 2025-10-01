export default () => ({
  a3: {
    baseUrl: process.env.A3_BASE_URL ?? 'http://localhost:4000',
    apiKey: process.env.A3_API_KEY ?? '',
    webhookSecret: process.env.A3_WEBHOOK_SECRET ?? ''
  },
  bc: {
    baseUrl: process.env.BC_BASE_URL ?? 'http://localhost:4100',
    tenantId: process.env.BC_TENANT_ID ?? '',
    clientId: process.env.BC_CLIENT_ID ?? '',
    clientSecret: process.env.BC_CLIENT_SECRET ?? '',
    webhookSecret: process.env.BC_WEBHOOK_SECRET ?? ''
  }
});
