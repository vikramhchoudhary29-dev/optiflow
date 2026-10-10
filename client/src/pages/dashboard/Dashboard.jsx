import { useEffect, useMemo, useState } from "react";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getDashboard } from "../../services/dashboard.service";
import { getDashboardAnnouncements } from "../../services/erp.service";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fullDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Icon({ type, className = "h-6 w-6" }) {
  const paths = {
    sale: <><circle cx="12" cy="12" r="9"/><path d="M8 8h7M8 11h7M10 8c3 0 3 4 0 4H8l5 5"/></>,
    customer: <><circle cx="12" cy="8" r="3"/><path d="M6 19c0-4 2-6 6-6s6 2 6 6M18 8h4M20 6v4"/></>,
    delivery: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    stock: <><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 7v9l8 5 8-5V7M12 11v10"/></>,
    report: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    purchase: <><path d="M3 4h2l2 10h11l2-7H7M9 19h.01M17 19h.01"/></>,
    alert: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[type]}</svg>;
}

function Sparkline({ color = "#6d4aff", values = [] }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${index * (80 / Math.max(values.length - 1, 1))},${30 - (value / max) * 25}`).join(" ");
  return <svg viewBox="0 0 80 34" className="h-10 w-20 overflow-visible"><polyline points={points || "0,30 80,30"} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function StatCard({ icon, label, value, note, tone, values }) {
  const styles = { violet: ["bg-violet-100", "text-violet-600", "#7c3aed"], blue: ["bg-blue-100", "text-blue-600", "#2563eb"], orange: ["bg-orange-100", "text-orange-500", "#f97316"], green: ["bg-emerald-100", "text-emerald-600", "#16a34a"] }[tone];
  return <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${styles[0]} ${styles[1]}`}><Icon type={icon}/></div>
    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 truncate text-xs text-slate-500">{note}</p></div>
    <Sparkline color={styles[2]} values={values}/>
  </section>;
}

function SalesChart({ items }) {
  const max = Math.max(...items.map((item) => item.total), 1);
  const points = items.map((item, index) => `${8 + index * (84 / Math.max(items.length - 1, 1))},${82 - (item.total / max) * 62}`).join(" ");
  return <div className="mt-5">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-56 w-full overflow-visible">
      {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="2 2" vectorEffect="non-scaling-stroke"/>) }
      <polygon points={`8,82 ${points} 92,82`} fill="url(#salesGradient)"/>
      <defs><linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c3aed" stopOpacity=".28"/><stop offset="1" stopColor="#7c3aed" stopOpacity="0"/></linearGradient></defs>
      <polyline points={points} fill="none" stroke="#6d3df5" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/>
      {items.map((item, index) => <circle key={item.date} cx={8 + index * (84 / Math.max(items.length - 1, 1))} cy={82 - (item.total / max) * 62} r="1.8" fill="white" stroke="#6d3df5" strokeWidth="1.2" vectorEffect="non-scaling-stroke"><title>{shortDate(item.date)}: {money(item.total)}</title></circle>)}
    </svg>
    <div className="grid grid-cols-7 text-center text-[11px] text-slate-500">{items.map((item) => <span key={item.date}>{shortDate(item.date)}</span>)}</div>
  </div>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  const load = async () => { try { const [response, notices] = await Promise.all([getDashboard(), getDashboardAnnouncements()]); setData(response.data); setAnnouncements(notices || []); } catch (requestError) { setError(requestError.response?.data?.message || "Could not load dashboard"); } };
  useEffect(() => { void load(); }, []);
  useAutoRefresh(load);

  const categoryData = useMemo(() => {
    const colors = ["#6d3df5", "#2f7df6", "#ff9418", "#37b878", "#ef4444"];
    const total = data?.salesByCategory?.reduce((sum, item) => sum + item.total, 0) || 0;
    let cursor = 0;
    const segments = (data?.salesByCategory || []).map((item, index) => { const start = total ? (cursor / total) * 360 : 0; cursor += item.total; return { ...item, color: colors[index % colors.length], percent: total ? Math.round((item.total / total) * 100) : 0, start, end: total ? (cursor / total) * 360 : 0 }; });
    return { segments, gradient: segments.length ? `conic-gradient(${segments.map((item) => `${item.color} ${item.start}deg ${item.end}deg`).join(",")})` : "#e2e8f0" };
  }, [data]);

  if (!data && !error) return <div className="grid min-h-[55vh] place-items-center text-slate-500"><div className="flex flex-col items-center gap-4"><span className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"/><span className="text-sm font-medium">Preparing your dashboard…</span><div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">{[1,2,3,4].map((item)=><span key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div></div></div>;
  const trend = data?.salesByDay?.map((item) => item.total) || [];
  const change = data?.yesterdaySales ? ((data.todaySales - data.yesterdaySales) / data.yesterdaySales) * 100 : 0;
  const actions = [
    ["New Sale", "/invoices", "sale", "bg-violet-50 text-violet-600"], ["Add Customer", "/customers", "customer", "bg-blue-50 text-blue-600"], ["Add Product", "/products", "stock", "bg-emerald-50 text-emerald-600"],
    ["Create Purchase", "/purchases", "purchase", "bg-orange-50 text-orange-600"], ["View Reports", "/reports", "report", "bg-violet-50 text-violet-600"], ["Low Stock", "/products", "alert", "bg-red-50 text-red-600"],
  ];

  return <div className="mx-auto max-w-[1600px] space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋</h1><p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening in your optical shop today.</p></div>
      <button type="button" onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm"><Icon type="report" className="h-4 w-4"/> Export report</button>
    </div>
    {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {announcements.map((notice) => <div key={notice.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${notice.tone === "URGENT" ? "border-red-200 bg-red-50 text-red-900" : notice.tone === "WARNING" ? "border-amber-200 bg-amber-50 text-amber-900" : notice.tone === "SUCCESS" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-sky-200 bg-sky-50 text-sky-950"}`}><span className="mt-0.5 text-lg" aria-hidden="true">{notice.tone === "URGENT" ? "⚠" : notice.tone === "WARNING" ? "!" : notice.tone === "SUCCESS" ? "✓" : "ℹ"}</span><div className="min-w-0"><p className="font-bold">{notice.title}</p><p className="mt-0.5 whitespace-pre-wrap text-sm">{notice.message}</p></div></div>)}
    {data && <>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard icon="sale" label="Today’s Sales" value={money(data.todaySales)} note={`${change >= 0 ? "↗" : "↘"} ${Math.abs(change).toFixed(1)}% vs yesterday`} tone="violet" values={trend}/>
        <StatCard icon="customer" label="Total Customers" value={data.totalCustomers} note={`${data.newCustomersThisWeek} new this week`} tone="blue" values={[0, data.newCustomersThisWeek, data.totalCustomers]}/>
        <StatCard icon="delivery" label="Pending Deliveries" value={data.pendingDeliveries} note="Pending and ready orders" tone="orange" values={[1, data.pendingDeliveries, 1, data.pendingDeliveries]}/>
        <StatCard icon="stock" label="Low Stock Items" value={data.lowStock} note="Check inventory now" tone="green" values={data.lowStockItems.map((item) => item.stock)}/>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr_.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Sales Overview</h2><span className="rounded-lg border px-3 py-1 text-xs text-slate-500">Last 7 days</span></div><SalesChart items={data.salesByDay}/></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Sales by Category</h2><div className="mt-7 flex flex-col items-center gap-7 sm:flex-row xl:flex-col 2xl:flex-row"><div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: categoryData.gradient }}><div className="absolute inset-9 grid place-items-center rounded-full bg-white text-center"><span className="text-xs text-slate-500">Total</span><strong className="text-sm">{money(categoryData.segments.reduce((sum, item) => sum + item.total, 0))}</strong></div></div><div className="w-full space-y-3">{categoryData.segments.slice(0,5).map((item) => <div key={item.category} className="flex items-center gap-2 text-sm"><i className="h-2.5 w-2.5 rounded-full" style={{background:item.color}}/><span className="min-w-0 flex-1 truncate">{item.category}<small className="block text-slate-400">{money(item.total)}</small></span><b>{item.percent}%</b></div>)}{!categoryData.segments.length && <p className="text-sm text-slate-400">No sales this week</p>}</div></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Quick Actions</h2><div className="mt-4 grid grid-cols-2 gap-3">{actions.map(([label,path,icon,tone]) => <Link key={label} to={path} className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-3 text-center text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}><Icon type={icon} className="h-7 w-7"/>{label}</Link>)}</div></section>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between p-5"><h2 className="font-bold">Recent Invoices</h2><Link to="/invoices" className="btn-secondary py-1.5 text-xs">View all</Link></div><div className="overflow-x-auto"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{data.recentInvoices.map((invoice) => <tr key={invoice.id}><td className="font-semibold text-violet-600">{invoice.invoiceCode}</td><td>{invoice.customer.name}</td><td className="font-semibold">{money(invoice.grandTotal)}</td><td><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${invoice.deliveryStatus === "DELIVERED" ? "bg-green-100 text-green-700" : invoice.deliveryStatus === "READY" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{invoice.deliveryStatus}</span></td><td>{fullDate(invoice.invoiceDate)}</td></tr>)}{!data.recentInvoices.length && <tr><td colSpan="5" className="text-center text-slate-400">No invoices yet</td></tr>}</tbody></table></div></section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between p-5"><h2 className="font-bold">Low Stock Products</h2><Link to="/products" className="btn-secondary py-1.5 text-xs">View all</Link></div><div className="overflow-x-auto"><table><thead><tr><th>Code</th><th>Product</th><th>Category</th><th>Stock</th><th>Value</th></tr></thead><tbody>{data.lowStockItems.slice(0,5).map((item) => <tr key={item.id}><td className="font-semibold">{item.sku}</td><td>{item.name}</td><td>{item.category?.name || "—"}</td><td className="font-bold text-red-600">{item.stock}</td><td>{money(item.stockValue)}</td></tr>)}{!data.lowStockItems.length && <tr><td colSpan="5" className="text-center text-emerald-600">All products have sufficient stock</td></tr>}</tbody></table></div></section>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-violet-700"><span className="grid h-10 w-10 place-items-center rounded-full bg-white">✓</span><div><strong>Your business is protected</strong><p className="text-xs text-violet-500">OptiFlow keeps each shop&apos;s data securely isolated.</p></div></div>
    </>}
  </div>;
}
