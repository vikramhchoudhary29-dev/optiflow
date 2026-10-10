# OptiFlow production scope

OptiFlow is a multi-shop optical ERP with a dedicated customer CRM.

| Area | Capability |
| --- | --- |
| Platform | Super Admin authentication, shop lifecycle, subscriptions and support login |
| Shop security | Tenant-scoped JWT authentication and per-module staff permissions |
| Dashboard | Sales, customers, deliveries, low stock and operational quick actions |
| CRM | Customer 360, follow-up queue, notes, calls, visits, reminders, timeline, prescription reminders and WhatsApp shortcut |
| Customers | Add, edit, deactivate, search and tenant-scoped customer records |
| Prescriptions | Right/left SPH, CYL, axis/add, PD, doctor data and expiry |
| Catalogue | Categories and unified frame/lens/accessory product management |
| Suppliers | Supplier management and purchase history |
| Inventory | Purchases, sales, stock movements and low-stock controls |
| Sales | Invoice creation/editing, payments, delivery state, GST/discounts and PDF output |
| Expenses | Expense management and date-based reporting |
| Reports | Sales, purchase, expense, stock and customer reporting |
| Marketing | Reusable WhatsApp click-to-chat templates without unofficial automation |
| Loyalty | Points earning, redemption and transaction history |
| Staff | Staff accounts, permissions, status, password reset and activity |
| Settings | Shop details, invoice settings and logo/document settings |
| Deployment | Vercel + Neon PostgreSQL + Prisma migrations |

## Verification

Run in CI or locally before production:

```bash
npm test
npx prisma validate --schema server/prisma/schema.prisma
npx prisma migrate status --schema server/prisma/schema.prisma
npm --prefix client run lint
npm --prefix client run build
```
