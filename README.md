# OptiFlow

OptiFlow is a multi-shop optical ERP + dedicated customer CRM.

## Current production architecture

- Frontend: React + Vite
- API: Node.js + Express
- ORM: Prisma
- Database: PostgreSQL on Neon
- Hosting: Vercel
- File storage: Vercel Blob (when enabled)
- Authentication: JWT with shop/platform separation

## Modules

- Dashboard
- Dedicated Customer CRM / Customer 360
- Customers
- Prescriptions
- Products, categories and stock
- Purchases and suppliers
- Sales/invoices and payments
- Expenses
- Reports
- Marketing / WhatsApp click-to-chat
- Loyalty
- Staff and permissions
- Platform administration and subscriptions

## Production rules

1. Never commit `.env` files or secrets.
2. Production schema changes use Prisma migrations.
3. Vercel deploys with `prisma migrate deploy` before building the client.
4. Every shop-owned query must remain tenant-scoped by `shopId`.
5. Platform admin routes and shop routes use separate authentication token types.

## Local setup

```bash
npm install
cp server/.env.example server/.env
# Fill DATABASE_URL and JWT_SECRET
npm run db:deploy
npm run dev
```

## CRM

The CRM is intentionally separate from the accounting/ERP navigation. It provides a customer 360 workspace with:

- customer search
- recent sales and balances
- prescription visibility
- follow-up queue
- notes, calls, visits and reminders
- activity timeline
- WhatsApp shortcut
- CRM dashboard metrics

CRM data is tenant-scoped and protected by the `crm` permission module.
