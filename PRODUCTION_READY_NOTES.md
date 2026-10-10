# OptiFlow Production-Ready Baseline

This package is based on the downloaded Vercel deployment source.

## Completed cleanup

- Removed downloaded `.env` secrets.
- Removed server logs and the hardcoded password reset utility.
- Removed generated `client/dist` from source control baseline.
- Removed legacy MySQL migration archive and MySQL runtime dependency.
- Updated documentation to PostgreSQL/Neon/Vercel.
- Changed Vercel build from `prisma db push` to `prisma migrate deploy`.
- Added a PostgreSQL CRM migration.
- Added dedicated CRM API and Customer 360 UI.
- Added CRM staff permission module.
- Added platform login payload validation and a basic login rate limiter.
- Added production `.gitignore` rules.

## CRM included in this baseline

- CRM dashboard metrics
- customer search
- Customer 360 profile
- recent sales/balance
- prescription history visibility
- activity timeline
- notes
- follow-ups
- calls
- WhatsApp activities
- visits
- reminders
- due dates and completion
- WhatsApp shortcut

## Important deployment step

Before production deployment, compare the Neon database migration state with `server/prisma/migrations/`. Do not run `prisma db push`.

Run:

```bash
npx prisma validate --schema server/prisma/schema.prisma
npx prisma migrate status --schema server/prisma/schema.prisma
npm test
npm --prefix client run lint
npm --prefix client run build
```

The environment in this package contains placeholders only. Configure real secrets in Vercel.

## Customer 360 / CRM upgrade

- Customers table now has a dedicated **View** action.
- Customer View includes customer profile, prescription history, purchase history, invoice history, loyalty points summary/history, and CRM timeline.
- Each customer invoice has a **View invoice** action that opens the existing invoice PDF.
- Customer profile access uses the existing `customers:view` permission, so staff do not need separate CRM permission just to view a customer from the Customers module.

## Reports upgrade

- Date range filtering is now available for Sales, Purchases, Expenses, Profit, and Customer reports.
- Date ranges are inclusive; the backend uses an exclusive next-day boundary for the `to` date.
- Day Book remains a single-day report.
- Report dates are displayed in DD/MM/YYYY format.
- Report tables have a scrollable layout for large datasets.
