# OptiFlow deployment: Vercel + Neon

OptiFlow is configured as one Vercel project: the Vite frontend is served from `client/dist`, and `/api/*` is handled by the Express application in `api/index.js`.

## 1. Create and connect Neon

In the Vercel project, install Neon from Marketplace. Set these variables for Production, Preview, and Development:

- `DATABASE_URL`: Neon pooled connection string.
- `DIRECT_URL`: Neon direct connection string, used for migrations.
- `JWT_SECRET`: a long random secret.
- `CORS_ORIGINS`: the final Vercel/custom-domain origin.
- `PLATFORM_ADMIN_NAME`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`.
- `BLOB_READ_WRITE_TOKEN`: provisioned by Vercel Blob for persistent shop logos.

Do not commit any real credentials.

## 2. Initialize the database

Pull the production variables, deploy the PostgreSQL migration, and seed the first platform administrator:

```powershell
vercel env pull .env.production.local --environment=production
npx dotenv-cli -e .env.production.local -- npm run db:deploy
npx dotenv-cli -e .env.production.local -- npm run db:seed
```

The seed is idempotent: rerunning it keeps the existing platform administrator instead of creating duplicates.

## 3. Deploy

```powershell
vercel deploy
```

Test the preview URL before production:

- `/api/health`
- platform login and shop login
- customer/product/supplier Excel import
- invoice create/edit, prescription save, stock update and PDF
- payments, expenses, Day Book and reports
- loyalty earn/redeem
- logo upload

After verification:

```powershell
vercel deploy --prod
```

## Local development after the conversion

Use a local PostgreSQL database or a Neon development branch. Put PostgreSQL `DATABASE_URL` and `DIRECT_URL` values in `server/.env`, then run the API and client as before.
