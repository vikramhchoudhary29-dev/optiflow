import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import { getCustomerProfile } from "../../services/customer.service";
import * as erp from "../../services/erp.service";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function Stat({ label, value, hint }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>;
}

export default function CustomerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCustomerProfile(id)
      .then((data) => { if (mounted) setCustomer(data); })
      .catch((e) => { if (mounted) setError(e.response?.data?.message || "Could not load customer"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6 text-slate-600">Loading customer profile...</div>;
  if (error) return <div className="space-y-4"><Alert error={error} /><button className="btn-secondary" onClick={() => navigate("/customers")}>Back to customers</button></div>;
  if (!customer) return null;

  const invoices = customer.invoice || [];
  const prescriptions = customer.prescription || [];
  const loyalty = customer.loyaltySummary || {};
  const allItems = invoices.flatMap((invoice) => (invoice.invoiceitem || []).map((item) => ({ ...item, invoiceCode: invoice.invoiceCode, invoiceDate: invoice.invoiceDate })));

  return <div className="mx-auto max-w-[1600px] space-y-5">
    <ModuleHeader
      title={customer.name}
      description={`${customer.customerCode} · ${customer.mobile}${customer.email ? ` · ${customer.email}` : ""}`}
      action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => navigate("/customers")}>← Customers</button><button className="btn-secondary" onClick={() => navigate(`/customers/${customer.id}/edit`)}>Edit customer</button><a className="btn-primary" href={`https://wa.me/${String(customer.mobile).replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a></div>}
    />
    <Alert error={error} />

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <Stat label="Invoices" value={invoices.length} hint="Purchase records" />
      <Stat label="Total sales" value={money(invoices.reduce((s, i) => s + Number(i.grandTotal), 0))} />
      <Stat label="Outstanding" value={money(invoices.reduce((s, i) => s + Number(i.balance), 0))} />
      <Stat label="Prescriptions" value={prescriptions.length} />
      <Stat label="Available points" value={loyalty.availablePoints ?? 0} />
      <Stat label="Points earned" value={loyalty.totalEarned ?? 0} />
      <Stat label="Points redeemed" value={loyalty.totalRedeemed ?? 0} />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Customer information</h2><p className="text-sm text-slate-500">Complete profile and contact details.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${customer.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{customer.active ? "Active" : "Inactive"}</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><small className="text-slate-500">Mobile</small><p className="font-semibold">{customer.mobile || "—"}</p></div><div><small className="text-slate-500">Email</small><p className="font-semibold">{customer.email || "—"}</p></div><div><small className="text-slate-500">Date of birth</small><p className="font-semibold">{date(customer.dob)}</p></div><div><small className="text-slate-500">City / State</small><p className="font-semibold">{[customer.city, customer.state].filter(Boolean).join(", ") || "—"}</p></div><div className="sm:col-span-2"><small className="text-slate-500">Address</small><p className="font-semibold">{[customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ") || "—"}</p></div></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Loyalty points</h2><p className="text-sm text-slate-500">Customer points collection and usage history.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Available" value={loyalty.availablePoints ?? 0} /><Stat label="Earned" value={loyalty.totalEarned ?? 0} /><Stat label="Redeemed" value={loyalty.totalRedeemed ?? 0} /><Stat label="Adjusted" value={loyalty.totalAdjusted ?? 0} /></div><div className="table-wrap mt-4 max-h-64 overflow-auto"><table><thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Remaining</th><th>Invoice</th></tr></thead><tbody>{(customer.loyaltyTransactions || []).map((item) => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{item.type}</td><td>{item.type === "REDEEM" ? `-${item.points}` : `+${item.points}`}</td><td>{item.remainingPoints}</td><td>{item.invoiceId ? invoices.find((i) => i.id === item.invoiceId)?.invoiceCode || `#${item.invoiceId}` : "—"}</td></tr>)}{!(customer.loyaltyTransactions || []).length && <tr><td colSpan="5" className="text-center text-slate-500">No loyalty transactions.</td></tr>}</tbody></table></div></section>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Prescription history</h2><p className="text-sm text-slate-500">All prescriptions saved for this customer.</p></div><button className="btn-secondary" onClick={() => navigate(`/prescriptions?customerId=${customer.id}`)}>Open prescriptions</button></div><div className="table-wrap mt-4"><table><thead><tr><th>Code</th><th>Date</th><th>Right eye</th><th>Left eye</th><th>PD</th><th>Expiry</th><th>Status</th></tr></thead><tbody>{prescriptions.map((rx) => <tr key={rx.id}><td>{rx.prescriptionCode}</td><td>{date(rx.prescriptionDate)}</td><td>{[rx.rightSph, rx.rightCyl, rx.rightAxis].filter((v) => v !== null && v !== "").join(" / ") || "—"}</td><td>{[rx.leftSph, rx.leftCyl, rx.leftAxis].filter((v) => v !== null && v !== "").join(" / ") || "—"}</td><td>{rx.pdDistance ?? "—"}</td><td>{date(rx.expiryDate)}</td><td>{rx.status}</td></tr>)}{!prescriptions.length && <tr><td colSpan="7" className="text-center text-slate-500">No prescriptions found.</td></tr>}</tbody></table></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="text-lg font-bold">Purchase history</h2><p className="text-sm text-slate-500">Items purchased by this customer across all invoices.</p></div><div className="table-wrap mt-4"><table><thead><tr><th>Date</th><th>Invoice</th><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>{allItems.map((item, index) => <tr key={`${item.invoiceCode}-${item.id}-${index}`}><td>{date(item.invoiceDate)}</td><td>{item.invoiceCode}</td><td>{item.itemName}<small>{item.itemCode || ""}</small></td><td>{item.quantity}</td><td>{money(item.price)}</td><td>{money(item.total)}</td></tr>)}{!allItems.length && <tr><td colSpan="6" className="text-center text-slate-500">No purchase history.</td></tr>}</tbody></table></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Invoice history</h2><p className="text-sm text-slate-500">Every invoice belonging to this customer.</p></div></div><div className="table-wrap mt-4"><table><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Received</th><th>Balance</th><th>Payment</th><th>Delivery</th><th>Action</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.invoiceCode}</strong></td><td>{date(invoice.invoiceDate)}</td><td>{money(invoice.grandTotal)}</td><td>{money(invoice.received)}</td><td>{money(invoice.balance)}</td><td>{invoice.paymentStatus}</td><td>{invoice.deliveryStatus}</td><td className="whitespace-nowrap"><button className="link" onClick={() => erp.openInvoicePdf(invoice.id)}>View invoice</button><button className="link ml-3" onClick={() => navigate(`/invoices?invoiceId=${invoice.id}`)}>Open billing</button></td></tr>)}{!invoices.length && <tr><td colSpan="8" className="text-center text-slate-500">No invoices found.</td></tr>}</tbody></table></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">CRM timeline</h2><p className="text-sm text-slate-500">Calls, follow-ups, notes and customer interactions.</p><div className="mt-4 space-y-3">{(customer.activities || []).map((activity) => <div key={activity.id} className="rounded-xl border p-3"><div className="flex flex-wrap justify-between gap-2"><strong>{activity.title}</strong><span className="text-xs text-slate-500">{dateTime(activity.createdAt)}</span></div><p className="mt-1 text-sm text-slate-600">{activity.note || activity.type.replace("_", " ")}</p><small className="text-slate-400">{activity.status} · {activity.createdBy?.name || "System"}</small></div>)}{!(customer.activities || []).length && <p className="text-sm text-slate-500">No CRM activity recorded.</p>}</div></section>
  </div>;
}
