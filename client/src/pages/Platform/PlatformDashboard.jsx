import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/common/Alert";
import * as api from "../../services/platform.service";
import PlatformHeader from "../../components/layout/PlatformHeader";
import "../../styles/platform.css";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const initialForm = () => ({
  shopName: "",
  ownerName: "",
  mobile: "",
  email: "",
  password: "",
  address: "",
  gstNumber: "",
  plan: "STARTER",
  accessType: "PAID",
  durationMonths: 12,
  amount: "",
  startDate: new Date().toISOString().slice(0, 10),
  paymentStatus: "PAID",
  paymentReference: "",
  paymentNotes: "",
});

export default function PlatformDashboard() {
  const [summary, setSummary] = useState({});
  const [planSettings, setPlanSettings] = useState(null);
  const [shops, setShops] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", tone: "INFO", published: true, startsAt: new Date().toISOString().slice(0, 16), endsAt: "", shopIds: [] });
  const [announcementBusy, setAnnouncementBusy] = useState(false);
  const [form, setForm] = useState(initialForm());
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("EXPIRY_ASC");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const requestMessage = (requestError, fallback) => {
    const issue = requestError.response?.data?.errors?.[0];
    const field = issue?.path?.join(" ");
    if (issue?.message)
      return field ? `${field}: ${issue.message}` : issue.message;
    return requestError.response?.data?.message || fallback;
  };

  const load = useCallback(async () => {
    if (!localStorage.getItem("platformToken"))
      return navigate("/platform/login");
    try {
      const [dashboard, tenants, settings, notices] = await Promise.all([
        api.dashboard(),
        api.shops(),
        api.getPlanSettings(),
        api.announcements(),
      ]);
      setSummary(dashboard);
      setShops(tenants);
      setAnnouncements(notices);
      setPlanSettings(settings);
      setForm((current) => current.amount === "" ? { ...current, amount: Number(settings.yearlyPrice || 0) } : current);
    } catch (requestError) {
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem("platformToken");
        navigate("/platform/login");
      } else
        setError(
          requestError.response?.data?.message || "Could not load platform",
        );
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load, { enabled: !show && !selectedShop });

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      if (editId) {
        const profile = {
          shopName: form.shopName,
          ownerName: form.ownerName,
          mobile: form.mobile,
          email: form.email || null,
          address: form.address || null,
          gstNumber: form.gstNumber || null,
        };
        await api.updateShop(editId, profile);
      } else await api.createShop(form);
      setForm(initialForm());
      setEditId(null);
      setShow(false);
      setSuccess(
        editId
          ? "Shop updated successfully."
          : "Shop created with the OptiFlow plan.",
      );
      await load();
    } catch (requestError) {
      setError(requestMessage(requestError, "Could not save shop"));
    }
  }

  function edit(shop) {
    setForm({
      ...initialForm(),
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      mobile: shop.mobile,
      email: shop.email || "",
      address: shop.address || "",
      gstNumber: shop.gstNumber || "",
      plan: shop.plan || "STARTER",
    });
    setEditId(shop.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function changeStatus(shop) {
    const next = !shop.status;
    if (
      !window.confirm(
        `${next ? "Activate" : "Deactivate"} ${shop.shopName}?${next ? "" : " Owner and staff will immediately lose access."}`,
      )
    )
      return;
    try {
      setBusy(`status-${shop.id}`);
      await api.setStatus(shop.id, next);
      setSuccess(
        `${shop.shopName} ${next ? "activated" : "deactivated"} successfully.`,
      );
      setError("");
      await load();
    } catch (requestError) {
      setError(requestMessage(requestError, "Could not update shop status"));
    } finally {
      setBusy("");
    }
  }

  async function startTrial(shop) {
    if (!window.confirm(`Start a 14-day OptiFlow trial for ${shop.shopName}?`))
      return;
    try {
      setBusy(`trial-${shop.id}`);
      await api.startTrial(shop.id, 14);
      setSuccess("14-day trial started successfully.");
      setError("");
      await load();
    } catch (requestError) {
      setError(requestMessage(requestError, "Could not start trial"));
    } finally {
      setBusy("");
    }
  }

  async function resetPassword(shop) {
    const password = window.prompt(
      `Enter a new password for ${shop.ownerName} (minimum 8 characters)`,
    );
    if (!password) return;
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    const confirmation = window.prompt(
      "Enter the new password again to confirm",
    );
    if (password !== confirmation) return setError("Passwords do not match.");
    try {
      setBusy(`password-${shop.id}`);
      await api.resetPassword(shop.id, password);
      setSuccess("Owner password reset successfully.");
      setError("");
    } catch (requestError) {
      setError(requestMessage(requestError, "Password reset failed"));
    } finally {
      setBusy("");
    }
  }

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      `${shop.shopName} ${shop.ownerName} ${shop.mobile} ${shop.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const expired = shop.expiryDate && new Date(shop.expiryDate) < new Date();
    return (
      matchesSearch &&
      (statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && shop.status && !expired) ||
        (statusFilter === "INACTIVE" && !shop.status) ||
        (statusFilter === "TRIAL" && shop.subscriptionStatus === "TRIAL") ||
        (statusFilter === "EXPIRED" && expired))
    );
  });
  filteredShops.sort((left, right) => {
    if (sort === "NAME") return left.shopName.localeCompare(right.shopName);
    const a = left.expiryDate
      ? new Date(left.expiryDate)
      : new Date(8640000000000000);
    const b = right.expiryDate
      ? new Date(right.expiryDate)
      : new Date(8640000000000000);
    return sort === "EXPIRY_DESC" ? b - a : a - b;
  });
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredShops.length / pageSize));
  const visibleShops = filteredShops.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  return (
    <div className="platform-shell">
      <PlatformHeader />
      <main className="platform-page">
        <div className="platform-title-row"><div><h1 className="platform-title">Platform Dashboard</h1><p className="platform-subtitle">Manage isolated optical-shop tenants and subscriptions.</p></div>
            <button
              className="platform-primary"
              onClick={() => {
                setShow(!show);
                setEditId(null);
                setForm({ ...initialForm(), amount: Number(planSettings?.yearlyPrice || 0) });
              }}
            >
              {show ? "Close" : "⊕ Create Shop"}
            </button>
        </div>
        <Alert error={error} />
        {success && (
          <div className="platform-alert success">
            {success}
          </div>
        )}
        <section className="platform-card p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold">Dashboard announcements</h2><p className="mt-1 text-sm text-slate-500">Publish a notice to selected shops only. Published notices appear at the top of their dashboards.</p></div>
          </div>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault(); setAnnouncementBusy(true); setError(""); setSuccess("");
            try {
              await api.createAnnouncement({ ...announcementForm, startsAt: announcementForm.startsAt ? new Date(announcementForm.startsAt).toISOString() : new Date().toISOString(), endsAt: announcementForm.endsAt ? new Date(announcementForm.endsAt).toISOString() : null });
              setAnnouncementForm({ title: "", message: "", tone: "INFO", published: true, startsAt: new Date().toISOString().slice(0, 16), endsAt: "", shopIds: [] });
              setSuccess("Announcement saved and assigned to selected shops."); await load();
            } catch (requestError) { setError(requestMessage(requestError, "Could not save announcement")); }
            finally { setAnnouncementBusy(false); }
          }}>
            <label className="block"><span className="mb-1 block text-sm font-medium">Announcement title</span><input required maxLength={160} className="platform-field w-full" value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} placeholder="e.g. Scheduled maintenance" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Style</span><select className="platform-field w-full" value={announcementForm.tone} onChange={(event) => setAnnouncementForm({ ...announcementForm, tone: event.target.value })}><option value="INFO">Information</option><option value="SUCCESS">Success</option><option value="WARNING">Warning</option><option value="URGENT">Urgent</option></select></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-sm font-medium">Message</span><textarea required maxLength={1200} rows={3} className="platform-field w-full" value={announcementForm.message} onChange={(event) => setAnnouncementForm({ ...announcementForm, message: event.target.value })} placeholder="Write the announcement shown on selected dashboards" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Starts at</span><input type="datetime-local" required className="platform-field w-full" value={announcementForm.startsAt} onChange={(event) => setAnnouncementForm({ ...announcementForm, startsAt: event.target.value })} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Expires at (optional)</span><input type="datetime-local" className="platform-field w-full" value={announcementForm.endsAt} onChange={(event) => setAnnouncementForm({ ...announcementForm, endsAt: event.target.value })} /></label>
            <div className="md:col-span-2 rounded-xl border border-slate-200 p-3"><div className="mb-2 flex items-center justify-between gap-3"><span className="font-semibold">Target shops</span><button type="button" className="platform-action" onClick={() => setAnnouncementForm({ ...announcementForm, shopIds: announcementForm.shopIds.length === shops.length ? [] : shops.map((shop) => shop.id) })}>{announcementForm.shopIds.length === shops.length ? "Clear selection" : "Select all shops"}</button></div><div className="grid max-h-40 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{shops.map((shop) => <label key={shop.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"><input type="checkbox" checked={announcementForm.shopIds.includes(shop.id)} onChange={(event) => setAnnouncementForm({ ...announcementForm, shopIds: event.target.checked ? [...announcementForm.shopIds, shop.id] : announcementForm.shopIds.filter((id) => id !== shop.id) })} />{shop.shopName}</label>)}</div></div>
            <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={announcementForm.published} onChange={(event) => setAnnouncementForm({ ...announcementForm, published: event.target.checked })} />Publish immediately (according to start/end dates)</label>
            <button disabled={announcementBusy || !announcementForm.shopIds.length} className="platform-primary md:col-span-2">{announcementBusy ? "Saving announcement…" : "Publish announcement"}</button>
          </form>
          <div className="mt-5 space-y-2">{announcements.map((notice) => <div key={notice.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong>{notice.title}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{notice.published ? "Published" : "Draft"}</span><span className="text-xs text-slate-500">{notice.tone}</span></div><p className="mt-1 text-sm text-slate-600">{notice.message}</p><p className="mt-1 text-xs text-slate-400">Shops: {notice.targets.map((target) => target.shop.shopName).join(", ")}</p></div><button type="button" className="platform-action text-red-600" onClick={async () => { if (!window.confirm(`Delete announcement “${notice.title}”?`)) return; try { await api.deleteAnnouncement(notice.id); await load(); } catch (requestError) { setError(requestMessage(requestError, "Could not delete announcement")); } }}>Delete</button></div>)}{!announcements.length && <p className="text-sm text-slate-400">No announcements configured yet.</p>}</div>
        </section>
        <div className="platform-metrics">
          {[
            ["Total shops", summary.totalShops,"▦"],
            ["Active", summary.activeShops,"↗"],
            ["Inactive", summary.inactiveShops,"♙"],
            ["Trials", summary.trialShops,"♜"],
            ["Expiring in 30 days", summary.expiringSubscriptions,"□"],
          ].map(([label, value,icon]) => (
            <div key={label} className="platform-card platform-metric"><span className="platform-metric-icon">{icon}</span><div>
              <small>{label}</small>
              <strong>{value ?? 0}</strong></div>
            </div>
          ))}
        </div>
        {show && (
          <form
            onSubmit={save}
            className="platform-card platform-form"
          >
            <div className="platform-form-grid">
            {[
              "shopName",
              "ownerName",
              "mobile",
              "email",
              "address",
              "gstNumber",
            ].map((key) => (
              <input
                key={key}
                required={key !== "gstNumber"}
                type={
                  key === "email" ? "email" : key === "mobile" ? "tel" : "text"
                }
                minLength={
                  ["shopName", "ownerName", "address"].includes(key)
                    ? 3
                    : undefined
                }
                maxLength={key === "mobile" ? 10 : undefined}
                pattern={key === "mobile" ? "[0-9]{10}" : undefined}
                title={key === "mobile" ? "Enter exactly 10 digits" : undefined}
                className="platform-field"
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            ))}
            {!editId && (
              <>
                <input
                  required
                  minLength={8}
                  maxLength={100}
                  type="password"
                  className="platform-field"
                  placeholder="Owner password (minimum 8 characters)"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
                <div className="md:col-span-3 mt-2 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                  <h3 className="mb-3 font-bold">Assign plan</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label><span className="label">Plan</span><input className="field bg-white" value={planSettings?.planName || "OptiFlow Plan"} readOnly /></label>
                    <label><span className="label">Access type</span><select className="field bg-white" value={form.accessType} onChange={(event)=>setForm({...form,accessType:event.target.value,amount:event.target.value === "TRIAL" ? 0 : Number(planSettings?.yearlyPrice || form.amount || 0)})}><option value="PAID">Paid plan</option><option value="TRIAL">Free trial ({planSettings?.trialDays || 14} days)</option></select></label>
                    <label><span className="label">Start date</span><input required type="date" className="field bg-white" value={form.startDate} onChange={(event)=>setForm({...form,startDate:event.target.value})}/></label>
                    {form.accessType === "PAID" && <>
                      <label><span className="label">Duration (months)</span><input required min="1" max="60" type="number" className="field bg-white" value={form.durationMonths} onChange={(event)=>setForm({...form,durationMonths:event.target.value})}/></label>
                      <label><span className="label">Plan amount</span><input required min="0" step="0.01" type="number" className="field bg-white" value={form.amount} onChange={(event)=>setForm({...form,amount:event.target.value})}/></label>
                      <label><span className="label">Payment status</span><select className="field bg-white" value={form.paymentStatus} onChange={(event)=>setForm({...form,paymentStatus:event.target.value})}>{["PAID","UNPAID","OVERDUE"].map(status=><option key={status}>{status}</option>)}</select></label>
                      <label><span className="label">Payment reference</span><input className="field bg-white" placeholder="UPI / bank / receipt reference" value={form.paymentReference} onChange={(event)=>setForm({...form,paymentReference:event.target.value})}/></label>
                      <label className="md:col-span-2"><span className="label">Plan notes</span><input className="field bg-white" placeholder="Optional notes" value={form.paymentNotes} onChange={(event)=>setForm({...form,paymentNotes:event.target.value})}/></label>
                    </>}
                  </div>
                </div>
              </>
            )}
            <button className="platform-primary">
              {editId ? "Update shop" : "Create tenant"}
            </button>
          </div></form>
        )}
        <div className="platform-card platform-toolbar">
          <input
            className="platform-field min-w-80 flex-1"
            placeholder="Search shop, owner, mobile or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="platform-field min-w-48"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            {["ALL", "ACTIVE", "INACTIVE", "TRIAL", "EXPIRED"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            className="platform-field min-w-48"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="EXPIRY_ASC">Expiry: nearest</option>
            <option value="EXPIRY_DESC">Expiry: latest</option>
            <option value="NAME">Shop name</option>
          </select>
          <button className="platform-secondary text-indigo-600" onClick={() => api.exportShops()}>
            ⇩ Export Excel
          </button>
        </div>
        <div className="platform-card platform-table-card">
          <table>
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleShops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    {shop.shopName}
                    <small>{shop.address}</small>
                  </td>
                  <td>{shop.ownerName}</td>
                  <td>
                    {shop.mobile}
                    <small>{shop.email}</small>
                  </td>
                  <td>
                    OPTIFLOW
                    <small>
                      {shop.subscriptionStatus === "TRIAL"
                        ? "Trial"
                        : "Paid plan"}
                    </small>
                  </td>
                  <td>
                    {shop.expiryDate
                      ? new Date(shop.expiryDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td><span className={shop.status?"platform-status":"platform-status !bg-red-50 !text-red-600"}>{shop.status ? "Active" : "Inactive"}</span></td>
                  <td className="whitespace-nowrap">
                    <button
                      className="platform-action"
                      onClick={async () => {
                        try {
                          setSelectedShop(await api.shopDetails(shop.id));
                        } catch (requestError) {
                          setError(
                            requestMessage(
                              requestError,
                              "Could not load shop details",
                            ),
                          );
                        }
                      }}
                    >
                      Details
                    </button>
                    <button className="platform-action" onClick={() => edit(shop)}>
                      Edit
                    </button>
                    <button
                      className="platform-action"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Open ${shop.shopName} as owner for a 30-minute support session? This will be logged.`,
                          )
                        )
                          return;
                        try {
                          await api.supportLogin(shop.id);
                          window.open("/", "_blank");
                          setSuccess(
                            "Secure support session opened in a new tab.",
                          );
                        } catch (requestError) {
                          setError(
                            requestMessage(
                              requestError,
                              "Support login failed",
                            ),
                          );
                        }
                      }}
                    >
                      Support login
                    </button>
                    <button
                      disabled={Boolean(busy)}
                      className="platform-action warning disabled:opacity-50"
                      onClick={() => changeStatus(shop)}
                    >
                      {shop.status ? "Deactivate" : "Activate"}
                    </button>
                    {!shop.subscriptionStatus && (
                      <button
                        disabled={Boolean(busy)}
                        className="platform-action disabled:opacity-50"
                        onClick={() => startTrial(shop)}
                      >
                        Trial
                      </button>
                    )}
                    <button
                      disabled={Boolean(busy)}
                      className="platform-action disabled:opacity-50"
                      onClick={() => resetPassword(shop)}
                    >
                      Reset password
                    </button>
                    <button
                      disabled={Boolean(busy)}
                      className="platform-action danger disabled:opacity-50"
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Permanently delete ${shop.shopName} and all data? This cannot be undone.`,
                          )
                        ) {
                          try {
                            setBusy(`delete-${shop.id}`);
                            await api.deleteShop(shop.id);
                            setSuccess(
                              `${shop.shopName} was permanently deleted.`,
                            );
                            await load();
                          } catch (requestError) {
                            setError(
                              requestMessage(
                                requestError,
                                "Could not delete shop",
                              ),
                            );
                          } finally {
                            setBusy("");
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="platform-pagination">
          <button
            className="platform-secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            className="platform-secondary"
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
        {selectedShop && (
          <div
            className="platform-modal"
            onClick={() => setSelectedShop(null)}
          >
            <article
              className="platform-card platform-modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="btn-secondary float-right"
                onClick={() => setSelectedShop(null)}
              >
                Close
              </button>
              <h2 className="text-2xl font-bold">{selectedShop.shopName}</h2>
              <p>
                {selectedShop.ownerName} · {selectedShop.mobile} ·{" "}
                {selectedShop.email}
              </p>
              <h3 className="mb-2 mt-5 font-bold">Shop analytics</h3>
              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Sales this month", selectedShop.analytics.salesThisMonth],
                  ["Total sales", selectedShop.analytics.totalSales],
                  ["Customer collections", selectedShop.analytics.collected],
                  ["Customer outstanding", selectedShop.analytics.outstanding],
                  ["Total purchases", selectedShop.analytics.totalPurchases],
                  ["Expenses", selectedShop.analytics.totalExpenses],
                  ["Supplier payments", selectedShop.analytics.supplierPayments],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-slate-50 p-3" key={label}>
                    <small>{label}</small>
                    <strong className="block text-xl">₹{Number(value || 0).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
              <h3 className="mb-2 font-bold">Subscription history</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Start</th>
                      <th>Expiry</th>
                      <th>Amount</th>
                      <th>Payment details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShop.subscriptions.map((row) => (
                      <tr key={row.id}>
                        <td>{row.status}</td>
                        <td>{new Date(row.startDate).toLocaleDateString()}</td>
                        <td>{new Date(row.expiryDate).toLocaleDateString()}</td>
                        <td>₹{Number(row.amount).toFixed(2)}</td>
                        <td>
                          {row.payments
                            ?.map(
                              (payment) =>
                                `${payment.reference || "-"} ${payment.notes || ""}`,
                            )
                            .join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="mb-2 mt-5 font-bold">Support access audit</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Admin</th>
                      <th>Started</th>
                      <th>Expires</th>
                      <th>Ended</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShop.supportSessions.map((row) => (
                      <tr key={row.id}>
                        <td>{row.admin.name}</td>
                        <td>{new Date(row.createdAt).toLocaleString()}</td>
                        <td>{new Date(row.expiresAt).toLocaleString()}</td>
                        <td>
                          {row.endedAt
                            ? new Date(row.endedAt).toLocaleString()
                            : "Active"}
                        </td>
                        <td>{row.ipAddress || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        )}
      </main>
    </div>
  );
}
