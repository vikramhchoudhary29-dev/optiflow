import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Link, useNavigate } from "react-router-dom";

import ModuleHeader from "../../components/common/ModuleHeader";

import Alert from "../../components/common/Alert";

import * as crm from "../../services/crm.service";

const money = (v) =>

  `₹${Number(v || 0).toLocaleString("en-IN", {

    maximumFractionDigits: 0,

  })}`;

const date = (v) =>

  v

    ? new Date(v).toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric",

      })

    : "—";

function Spinner({ label = "Loading..." }) {

  return (

    <div className="crm-spinner-wrap" role="status" aria-live="polite">

      <span className="crm-spinner" aria-hidden="true" />

      <span>{label}</span>

    </div>

  );

}

function Metric({ label, value, hint }) {

  return (

    <div className="crm-card crm-metric rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{hint}</p>

    </div>

  );

}

function StatusBadge({ children, tone = "slate" }) {

  return (

    <span className={`crm-status crm-status-${tone}`}>

      {children}

    </span>

  );

}

export default function CRM() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [customers, setCustomers] = useState(null);

  const [activities, setActivities] = useState([]);

  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [customerLoading, setCustomerLoading] = useState(false);

  const [savingActivity, setSavingActivity] = useState(false);

  const [completingId, setCompletingId] = useState(null);

  const [activityForm, setActivityForm] = useState({

    type: "FOLLOW_UP",

    title: "Follow up with customer",

    note: "",

    dueDate: "",

  });

  const load = useCallback(async () => {

    try {

      setLoading(true);

      const [d, c, a] = await Promise.all([

        crm.getCrmDashboard(),

        crm.getCrmCustomers({

          search,

          limit: 50,

        }),

        crm.getCrmActivities({

          status: "OPEN",

        }),

      ]);

      setDashboard(d);

      setCustomers(c);

      setActivities(a);

      setError("");

    } catch (e) {

      setError(

        e.response?.data?.message || "Could not load CRM"

      );

    } finally {

      setLoading(false);

    }

  }, [search]);

  useEffect(() => {

    const t = setTimeout(load, 180);

    return () => clearTimeout(t);

  }, [load]);

  async function openCustomer(id) {

    try {

      setCustomerLoading(true);

      const customer = await crm.getCrmCustomer(id);

      setSelected(customer);

    } catch (e) {

      setError(

        e.response?.data?.message ||

          "Could not load customer profile"

      );

    } finally {

      setCustomerLoading(false);

    }

  }

  async function addActivity(e) {

    e.preventDefault();

    if (!selected) return;

    try {

      setSavingActivity(true);

      await crm.createCrmActivity({

        customerId: selected.id,

        ...activityForm,

        dueDate: activityForm.dueDate

          ? new Date(activityForm.dueDate).toISOString()

          : "",

      });

      setActivityForm({

        type: "FOLLOW_UP",

        title: "Follow up with customer",

        note: "",

        dueDate: "",

      });

      await openCustomer(selected.id);

      await load();

    } catch (e) {

      setError(

        e.response?.data?.message ||

          "Could not create CRM activity"

      );

    } finally {

      setSavingActivity(false);

    }

  }

  async function complete(id) {

    try {

      setCompletingId(id);

      await crm.updateCrmActivityStatus(id, "DONE");

      await load();

      if (selected) {

        await openCustomer(selected.id);

      }

    } catch (e) {

      setError(

        e.response?.data?.message ||

          "Could not update activity"

      );

    } finally {

      setCompletingId(null);

    }

  }

  /*

   * Prevent the main page from scrolling behind Customer 360.

   * The Customer 360 modal itself handles scrolling.

   */

  useEffect(() => {

    if (!selected) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = previousOverflow;

    };

  }, [selected]);

  return (

    <div className="mx-auto max-w-[1600px] space-y-5 crm-page">

      <ModuleHeader

        title="Customer CRM"

        description="Manage customer relationships, follow-ups, prescription reminders, notes and sales history from one workspace."

      />

      <Alert error={error} />

      {dashboard && (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <Metric

            label="Active customers"

            value={dashboard.activeCustomers}

            hint="Current customer base"

          />

          <Metric

            label="New customers"

            value={dashboard.newCustomers}

            hint="Last 30 days"

          />

          <Metric

            label="Open follow-ups"

            value={dashboard.openFollowUps}

            hint="Calls & reminders"

          />

          <Metric

            label="Overdue"

            value={dashboard.overdueFollowUps}

            hint="Needs attention"

          />

          <Metric

            label="Rx expiring"

            value={dashboard.expiringPrescriptions}

            hint="Next 30 days"

          />

          <Metric

            label="Birthdays"

            value={dashboard.upcomingBirthdays}

            hint="Next 30 days"

          />

        </div>

      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">

        <section className="crm-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-bold">

                Customer 360

              </h2>

              <p className="text-sm text-slate-500">

                Search customers and open their complete

                relationship timeline.

              </p>

            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">

              <input

                className="field min-w-0 sm:min-w-[260px]"

                placeholder="Search name, mobile, code..."

                value={search}

                onChange={(e) =>

                  setSearch(e.target.value)

                }

              />

              <Link

                to="/customers/new"

                className="btn-primary whitespace-nowrap text-center"

              >

                + Customer

              </Link>

            </div>

          </div>

          <div className="table-wrap crm-table-wrap">

            <table className="crm-table">

              <thead>

                <tr>

                  <th>Customer</th>

                  <th>Last sale</th>

                  <th>Rx</th>

                  <th>Invoices</th>

                  <th>Balance</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {loading && !customers ? (

                  <tr>

                    <td colSpan="6">

                      <div className="py-10">

                        <Spinner label="Loading customers..." />

                      </div>

                    </td>

                  </tr>

                ) : (

                  customers?.items?.map((c) => (

                    <tr

                      key={c.id}

                      className="crm-row"

                    >

                      <td>

                        <strong className="block">

                          {c.name}

                        </strong>

                        <small>

                          {c.customerCode} · {c.mobile}

                        </small>

                      </td>

                      <td>

                        {date(

                          c.invoice?.[0]?.invoiceDate

                        )}

                      </td>

                      <td>

                        {c.prescription?.[0]?.expiryDate

                          ? date(

                              c.prescription[0].expiryDate

                            )

                          : "—"}

                      </td>

                      <td>{c._count.invoice}</td>

                      <td>

                        {money(

                          c.invoice?.[0]?.balance

                        )}

                      </td>

                      <td>

                        <button

                          className="link crm-open-btn"

                          onClick={() =>

                            openCustomer(c.id)

                          }

                        >

                          Open 360{" "}

                          <span>→</span>

                        </button>

                      </td>

                    </tr>

                  ))

                )}

                {!loading &&

                  !customers?.items?.length && (

                    <tr>

                      <td

                        colSpan="6"

                        className="text-center text-slate-500"

                      >

                        No customers found.

                      </td>

                    </tr>

                  )}

              </tbody>

            </table>

          </div>

        </section>

        <section className="crm-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold">

            Follow-up queue

          </h2>

          <p className="mb-4 text-sm text-slate-500">

            Work the next customer actions first.

          </p>

          <div className="space-y-3">

            {activities.slice(0, 8).map((a) => (

              <div

                key={a.id}

                className="crm-list-item rounded-xl border p-3"

              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <strong>{a.title}</strong>

                    <p className="text-sm text-slate-600">

                      {a.customer.name} ·{" "}

                      {a.customer.mobile}

                    </p>

                    <small

                      className={

                        a.dueDate &&

                        new Date(a.dueDate) < new Date()

                          ? "text-red-600"

                          : "text-slate-500"

                      }

                    >

                      {a.dueDate

                        ? `Due ${date(a.dueDate)}`

                        : "No due date"}

                    </small>

                  </div>

                  <button

                    className="btn-secondary shrink-0 px-2 py-1 text-xs"

                    disabled={completingId === a.id}

                    onClick={() => complete(a.id)}

                  >

                    {completingId === a.id

                      ? "..."

                      : "Done"}

                  </button>

                </div>

              </div>

            ))}

            {!activities.length && (

              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">

                No open follow-ups. Your queue is

                clear.

              </p>

            )}

          </div>

        </section>

      </div>

      {/* =========================================================

          CUSTOMER 360 MODAL

          ========================================================= */}

      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-6"

          onClick={() => setSelected(null)}

          role="dialog"

          aria-modal="true"

          aria-label="Customer 360"

        >

          <div className="flex min-h-full w-full items-start justify-center">

            <section

              className="crm-modal-enter my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-y-auto rounded-2xl bg-slate-50 shadow-2xl ring-1 ring-black/10 sm:my-4 sm:max-h-[calc(100dvh-3rem)]"

              onClick={(e) => e.stopPropagation()}

            >

              {/* CUSTOMER HEADER */}

              <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">

                <div className="min-w-0">

                  <p className="mb-1 text-[11px] font-bold tracking-[0.16em] text-violet-600">

                    CUSTOMER 360

                  </p>

                  <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">

                    {selected.name}

                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-500">

                    {selected.customerCode} ·{" "}

                    {selected.mobile}

                    {selected.email

                      ? ` · ${selected.email}`

                      : ""}

                  </p>

                </div>

                <div className="flex w-full shrink-0 gap-2 sm:w-auto">

                  <a

                    className="btn-secondary flex-1 text-center sm:flex-none"

                    href={`https://wa.me/${String(

                      selected.mobile || ""

                    ).replace(/\D/g, "")}`}

                    target="_blank"

                    rel="noreferrer"

                  >

                    WhatsApp

                  </a>

                  <button

                    className="btn-secondary flex-1 sm:flex-none"

                    onClick={() => setSelected(null)}

                  >

                    Close

                  </button>

                </div>

              </div>

              {/* CUSTOMER CONTENT */}

              <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">

                {/* ADD ACTIVITY */}

                <section className="crm-panel">

                  <h3 className="font-bold">

                    Add activity

                  </h3>

                  <form

                    onSubmit={addActivity}

                    className="mt-3 space-y-3"

                  >

                    <select

                      className="field"

                      value={activityForm.type}

                      onChange={(e) =>

                        setActivityForm({

                          ...activityForm,

                          type: e.target.value,

                        })

                      }

                    >

                      <option value="FOLLOW_UP">

                        Follow-up

                      </option>

                      <option value="CALL">

                        Call

                      </option>

                      <option value="WHATSAPP">

                        WhatsApp

                      </option>

                      <option value="VISIT">

                        Visit

                      </option>

                      <option value="REMINDER">

                        Reminder

                      </option>

                      <option value="NOTE">

                        Note

                      </option>

                    </select>

                    <input

                      className="field"

                      value={activityForm.title}

                      onChange={(e) =>

                        setActivityForm({

                          ...activityForm,

                          title: e.target.value,

                        })

                      }

                      placeholder="Activity title"

                      required

                    />

                    <textarea

                      className="field"

                      rows="4"

                      value={activityForm.note}

                      onChange={(e) =>

                        setActivityForm({

                          ...activityForm,

                          note: e.target.value,

                        })

                      }

                      placeholder="Notes / customer requirement"

                    />

                    <input

                      className="field"

                      type="datetime-local"

                      value={activityForm.dueDate}

                      onChange={(e) =>

                        setActivityForm({

                          ...activityForm,

                          dueDate: e.target.value,

                        })

                      }

                    />

                    <button

                      className="btn-primary w-full"

                      disabled={savingActivity}

                    >

                      {savingActivity ? (

                        <span className="inline-flex items-center justify-center gap-2">

                          <span className="crm-mini-spinner" />

                          Saving...

                        </span>

                      ) : (

                        "Save activity"

                      )}

                    </button>

                  </form>

                </section>

                {/* RELATIONSHIP SUMMARY */}

                <section className="crm-panel">

                  <h3 className="font-bold">

                    Relationship summary

                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <div className="crm-stat">

                      <small>Invoices</small>

                      <strong>

                        {selected.invoice.length}

                      </strong>

                    </div>

                    <div className="crm-stat">

                      <small>Prescriptions</small>

                      <strong>

                        {selected.prescription.length}

                      </strong>

                    </div>

                    <div className="crm-stat">

                      <small>Last sale</small>

                      <strong>

                        {date(

                          selected.invoice[0]

                            ?.invoiceDate

                        )}

                      </strong>

                    </div>

                    <div className="crm-stat">

                      <small>Last Rx</small>

                      <strong>

                        {date(

                          selected.prescription[0]

                            ?.prescriptionDate

                        )}

                      </strong>

                    </div>

                  </div>

                </section>

                {/* TIMELINE */}

                <section className="crm-panel lg:col-span-2">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <h3 className="font-bold">

                        Timeline

                      </h3>

                      <p className="text-xs text-slate-500">

                        Customer interactions and

                        follow-ups

                      </p>

                    </div>

                  </div>

                  <div className="mt-3 space-y-3">

                    {selected.activities.map((a) => (

                      <div

                        key={a.id}

                        className="crm-timeline-item flex gap-3 rounded-lg border p-3"

                      >

                        <span className="crm-timeline-dot mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap justify-between gap-2">

                            <strong>

                              {a.title}

                            </strong>

                            <small className="text-slate-500">

                              {date(a.createdAt)}

                            </small>

                          </div>

                          <p className="text-sm text-slate-600">

                            {a.note ||

                              a.type.replace(

                                "_",

                                " "

                              )}

                          </p>

                          <small className="text-slate-400">

                            {a.createdBy?.name ||

                              "System"}{" "}

                            · {a.status}

                          </small>

                        </div>

                      </div>

                    ))}

                    {!selected.activities.length && (

                      <p className="text-sm text-slate-500">

                        No CRM activities yet.

                      </p>

                    )}

                  </div>

                </section>

                {/* RECENT SALES */}

                <section className="crm-panel lg:col-span-2">

                  <div className="flex flex-wrap items-end justify-between gap-2">

                    <div>

                      <h3 className="font-bold">

                        Recent sales

                      </h3>

                      <p className="text-xs text-slate-500">

                        Open the original invoice

                        directly from the customer

                        profile.

                      </p>

                    </div>

                    <span className="text-xs text-slate-400">

                      {selected.invoice.length} invoice

                      {selected.invoice.length === 1

                        ? ""

                        : "s"}

                    </span>

                  </div>

                  <div className="table-wrap mt-3 crm-sales-table-wrap">

                    <table className="crm-table">

                      <thead>

                        <tr>

                          <th>Invoice</th>

                          <th>Date</th>

                          <th>Total</th>

                          <th>Received</th>

                          <th>Balance</th>

                          <th>Delivery</th>

                          <th>Action</th>

                        </tr>

                      </thead>

                      <tbody>

                        {selected.invoice.map((i) => (

                          <tr key={i.id}>

                            <td className="font-semibold text-violet-600">

                              {i.invoiceCode}

                            </td>

                            <td>

                              {date(i.invoiceDate)}

                            </td>

                            <td>

                              {money(i.grandTotal)}

                            </td>

                            <td>

                              {money(i.received)}

                            </td>

                            <td>

                              {money(i.balance)}

                            </td>

                            <td>

                              <StatusBadge

                                tone={

                                  i.deliveryStatus ===

                                  "DELIVERED"

                                    ? "green"

                                    : i.deliveryStatus ===

                                      "READY"

                                    ? "blue"

                                    : "orange"

                                }

                              >

                                {i.deliveryStatus}

                              </StatusBadge>

                            </td>

                            <td>

                              <button

                                type="button"

                                className="link crm-open-invoice"

                                onClick={() =>

                                  navigate(

                                    `/invoices?invoiceId=${i.id}`

                                  )

                                }

                              >

                                View invoice{" "}

                                <span>→</span>

                              </button>

                            </td>

                          </tr>

                        ))}

                        {!selected.invoice.length && (

                          <tr>

                            <td

                              colSpan="7"

                              className="text-center text-slate-500"

                            >

                              No sales found for this

                              customer.

                            </td>

                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                </section>

              </div>

            </section>

          </div>

          </div>,
          document.body
        )}

      {/* CUSTOMER 360 LOADING */}

      {customerLoading && (

        <div

          className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]"

          role="status"

          aria-live="polite"

        >

          <div className="crm-loading-card rounded-2xl bg-white px-6 py-5 shadow-2xl">

            <Spinner label="rukk jaa bhai khul raha hai..." />

          </div>

        </div>

      )}

    </div>

  );

}