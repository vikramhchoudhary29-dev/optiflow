import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import { getReport } from "../../services/erp.service";

const types = [
  ["sales", "Sales"], ["purchases", "Purchases"], ["expenses", "Expenses"],
  ["profit", "Profit"], ["stock", "Stock"], ["customers", "Customers"], ["day-book", "Day Book"],
];
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const formatTime = (value) => value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const moneyKey = (key) => ["amount", "sales", "value", "received", "outstanding", "cost", "profit", "total"].some((part) => key.toLowerCase().includes(part));
const rangeTypes = new Set(["sales", "purchases", "expenses", "profit", "customers"]);

function ReportRows({ type, items }) {
  if (type === "stock") return <table><thead><tr><th>Item code</th><th>Product</th><th>Category</th><th>Stock</th><th>Purchase value</th><th>Selling value</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.sku}</td><td>{item.name}<small>{item.brand}</small></td><td>{item.category?.name || "—"}</td><td>{item.stock}</td><td>{money(Number(item.purchasePrice) * item.stock)}</td><td>{money(Number(item.sellingPrice) * item.stock)}</td></tr>)}</tbody></table>;
  if (type === "day-book") return <table><thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Reference</th><th>Party / details</th><th>Debit</th><th>Credit</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{formatDate(item.date)}</td><td>{formatTime(item.date)}</td><td>{item.type}</td><td>{item.reference}</td><td>{item.party}<small>{item.method || ""}</small></td><td>{item.debit ? money(item.debit) : "—"}</td><td>{item.credit ? money(item.credit) : "—"}</td></tr>)}</tbody></table>;
  if (type === "customers") return <table><thead><tr><th>Code</th><th>Customer</th><th>Status</th><th>Invoices</th><th>Total purchases</th><th>Outstanding</th><th>Last purchase</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.customerCode}</td><td>{item.name}<small>{item.mobile}{item.city ? ` · ${item.city}` : ""}</small></td><td>{item.active ? "Active" : "Inactive"}</td><td>{item.totalInvoices}</td><td>{money(item.totalSales)}</td><td>{money(item.outstanding)}</td><td>{formatDate(item.lastPurchase)}</td></tr>)}</tbody></table>;
  return <table><thead><tr><th>Reference</th><th>Date</th><th>Name / description</th><th>Status</th><th>Amount</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id || index}><td>{item.invoiceCode || item.purchaseCode || item.id}</td><td>{formatDate(item.invoiceDate || item.purchaseDate || item.expenseDate)}</td><td>{item.customer?.name || item.supplier?.name || item.description}</td><td>{item.paymentStatus || item.paymentMethod || "—"}</td><td>{money(item.grandTotal ?? item.totalAmount ?? item.amount)}</td></tr>)}</tbody></table>;
}

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState("sales");
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (selected = type) => {
    try {
      setLoading(true);
      const params = selected === "day-book"
        ? { date }
        : rangeTypes.has(selected)
          ? { from: from || undefined, to: to || undefined }
          : {};
      setData(await getReport(selected, params));
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load report");
    } finally {
      setLoading(false);
    }
  }, [date, from, to, type]);

  useEffect(() => { void load(type); }, [load, type]);

  const summary = useMemo(() => data ? Object.entries(data).filter(([key, value]) => key !== "items" && typeof value !== "object") : [], [data]);
  const dated = rangeTypes.has(type);

  function clearDates() { setFrom(""); setTo(""); }

  return <div className="report-page mx-auto max-w-[1600px] space-y-5">
    <ModuleHeader title="Reports" description="Clear, date-filtered business reports for sales, purchases, expenses, profit, customers and cash flow." />
    <Alert error={error} />

    <div className="flex flex-wrap gap-2">{types.map(([value, label]) => <button key={value} onClick={() => setType(value)} className={type === value ? "btn-primary" : "btn-secondary"}>{label}</button>)}</div>

    {dated && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-end gap-3"><label className="min-w-[190px] flex-1"><span className="mb-1 block text-sm font-medium text-slate-600">From date</span><input type="date" className="field" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="min-w-[190px] flex-1"><span className="mb-1 block text-sm font-medium text-slate-600">To date</span><input type="date" className="field" value={to} onChange={(event) => setTo(event.target.value)} /></label><button className="btn-primary" onClick={() => load(type)} disabled={loading}>{loading ? "Loading..." : "Apply filter"}</button><button className="btn-secondary" onClick={() => { clearDates(); setTimeout(() => load(type), 0); }}>Clear</button></div><p className="mt-2 text-xs text-slate-500">Dates are applied inclusively. Report dates are shown as DD/MM/YYYY.</p></section>}
    {type === "day-book" && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-end gap-3"><label className="min-w-[220px]"><span className="mb-1 block text-sm font-medium text-slate-600">Day</span><input type="date" className="field" value={date} onChange={(event) => setDate(event.target.value)} /></label><button className="btn-primary" onClick={() => load(type)} disabled={loading}>{loading ? "Loading..." : "Open day"}</button></div><p className="mt-2 text-xs text-slate-500">Day Book includes the complete selected day.</p></section>}

    <div className="flex justify-end"><button className="btn-secondary print-action" onClick={() => window.print()}>Print report</button></div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{summary.map(([key, value]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</div><strong className="mt-1 block text-2xl text-slate-900">{moneyKey(key) ? money(value) : value}</strong></div>)}</div>

    <div className="table-wrap max-h-[65vh] overflow-auto"><ReportRows type={type} items={data?.items || []} /></div>
    {data && !data.items?.length && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No records found for the selected period.</div>}
  </div>;
}
