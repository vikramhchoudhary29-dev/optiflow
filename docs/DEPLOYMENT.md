# OptiFlow production deployment

## Production stack

- Vercel for the application/API
- Neon PostgreSQL for production data
- Prisma migrations for schema changes
- Vercel Blob for file storage when enabled

## Required environment variables

Configure these in the Vercel project settings. Do not commit them to Git.

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGINS=https://your-production-domain
BLOB_READ_WRITE_TOKEN=...
```

For the first platform admin, configure the seed variables separately:

```text
PLATFORM_ADMIN_NAME=...
PLATFORM_ADMIN_EMAIL=...
PLATFORM_ADMIN_PASSWORD=...
```

## Deployment

The production build runs:

```bash
prisma migrate deploy --schema server/prisma/schema.prisma
prisma generate --schema server/prisma/schema.prisma
npm install --prefix client --include=optional
npm --prefix client run build
```

Never use `prisma migrate dev` or `prisma db push` against production.

## Release workflow

1. Test locally.
2. Review the migration SQL.
3. Deploy to a Vercel preview.
4. Verify login, tenant isolation, sales, inventory and CRM.
5. Promote the preview to production.
6. Confirm `/api/health` and the production dashboard.

## Backups

Use Neon backups/branching and keep an independent backup strategy for business-critical data. Test restoration before major schema changes.
