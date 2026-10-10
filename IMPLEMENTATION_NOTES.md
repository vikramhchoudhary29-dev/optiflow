# OptiFlow requested updates

Implemented in this project copy:

- Invoice date is now editable on create and edit; new invoices still default to today's local date.
- Edit Invoice exposes the advance-payment amount and payment method. The API updates the original advance payment row while retaining subsequent collected payments and recalculates received/balance/status.
- Product code/barcode matching accepts upper- and lowercase input; product names are not forced to uppercase.
- Added a route-change progress indicator, invoice-list loading indicator, dashboard loading skeleton/spinner, and invoice-save spinner.
- Added Super Admin announcement management with selected-shop targeting, publish/draft status, start/end schedule and tone. Published, currently active notices appear at the top of only the selected shops' dashboards.

## Apply database change

From the project root, run:

```powershell
cd server
npx prisma migrate deploy
npx prisma generate
```

Then restart the server. Start the frontend from another terminal:

```powershell
cd client
npm run dev
```

The new announcement table migration is `server/prisma/migrations/20261010000000_announcements/migration.sql`.

## Notes

- This bundle intentionally excludes `.env`, `node_modules`, `.git`, and generated build/output folders. Keep your existing local `.env` file outside this archive.
- Test advance-payment edits on a test invoice first, especially invoices that already have later payment collections, before using the feature for live accounting.
