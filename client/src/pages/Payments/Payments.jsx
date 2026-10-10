import { useEffect, useMemo, useState } from "react";
import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import Expenses from "../Expenses/Expenses";
import * as erp from "../../services/erp.service";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
const blank = () => ({
  invoiceId: "",
  amount: "",
  method: "CASH",
  reference: "",
  notes: "",
});
const blankOut = () => ({ supplierId: "", amount: "", paymentDate: new Date().toISOString().slice(0,10), paymentMethod: "CASH", reference: "", notes: "" });

export default function Payments() {
  const [tab, setTab] = useState("payments");
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(blank());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [suppliers,setSuppliers]=useState([]), [paymentOut,setPaymentOut]=useState([]), [outForm,setOutForm]=useState(blankOut()), [editOutId,setEditOutId]=useState(null), [viewOut,setViewOut]=useState(null);

  async function load() {
    try {
      const [invoiceRows, paymentRows, supplierRows, outRows] = await Promise.all([
        erp.listInvoices(),
        erp.listPayments(),
        erp.listSuppliers(),
        erp.listSupplierPayments(),
      ]);
      setInvoices(invoiceRows);
      setPayments(paymentRows);
      setSuppliers(supplierRows.filter(row=>row.active));
      setPaymentOut(outRows);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load payments",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useAutoRefresh(load, { enabled: !editOutId && !viewOut });

  const outstanding = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          Number(invoice.balance) > 0 &&
          `${invoice.invoiceCode} ${invoice.customer.name} ${invoice.customer.mobile}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [invoices, search],
  );
  const selectedInvoice = invoices.find(
    (invoice) => invoice.id === Number(form.invoiceId),
  );

  async function collect(event) {
    event.preventDefault();
    try {
      await erp.createPayment({
        ...form,
        invoiceId: Number(form.invoiceId),
        amount: Number(form.amount),
        reference: form.reference || null,
        notes: form.notes || null,
      });
      setForm(blank());
      setSearch("");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not record payment",
      );
    }
  }
  async function savePaymentOut(event){event.preventDefault();try{const body={...outForm,supplierId:Number(outForm.supplierId),amount:Number(outForm.amount),reference:outForm.reference||null,notes:outForm.notes||null};if(editOutId)await erp.updateSupplierPayment(editOutId,body);else await erp.createSupplierPayment(body);setOutForm(blankOut());setEditOutId(null);await load()}catch(e){setError(e.response?.data?.message||"Could not save supplier payment")}}

  return (
    <div>
      <ModuleHeader
        title="Payments"
        description="Manage customer collections, supplier payments and expenses."
      />
      <Alert error={error} />
      <div className="mb-5 flex gap-2">
        <button
          className={tab === "payment-out" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("payment-out")}
        >
          Payment Out
        </button>
        <button
          className={tab === "payments" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("payments")}
        >
          Customer Payments
        </button>
        <button
          className={tab === "expenses" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("expenses")}
        >
          Add Expenses
        </button>
      </div>
      {tab === "expenses" ? (
        <Expenses embedded />
      ) : tab === "payment-out" ? (
        <><form onSubmit={savePaymentOut} className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4"><label>Supplier<select required className="field" value={outForm.supplierId} onChange={e=>setOutForm({...outForm,supplierId:e.target.value})}><option value="">Select supplier</option>{suppliers.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label><label>Amount paid<input required className="field" type="number" min="0.01" step="0.01" value={outForm.amount} onChange={e=>setOutForm({...outForm,amount:e.target.value})}/></label><label>Payment date<input required className="field" type="date" value={outForm.paymentDate} onChange={e=>setOutForm({...outForm,paymentDate:e.target.value})}/></label><label>Method<select className="field" value={outForm.paymentMethod} onChange={e=>setOutForm({...outForm,paymentMethod:e.target.value})}>{["CASH","UPI","CARD","BANK"].map(x=><option key={x}>{x}</option>)}</select></label><label>Reference<input className="field" value={outForm.reference} onChange={e=>setOutForm({...outForm,reference:e.target.value})}/></label><label className="xl:col-span-2">Notes<input className="field" value={outForm.notes} onChange={e=>setOutForm({...outForm,notes:e.target.value})}/></label><div className="flex items-end gap-2"><button className="btn-primary">{editOutId?"Update payment":"Record payment out"}</button>{editOutId&&<button type="button" className="btn-secondary" onClick={()=>{setEditOutId(null);setOutForm(blankOut())}}>Cancel</button>}</div></form>
        <div className="table-wrap"><table><thead><tr><th>Date</th><th>Receipt</th><th>Supplier</th><th>Method</th><th>Reference</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{paymentOut.map(row=><tr key={row.id}><td>{new Date(row.paymentDate).toLocaleDateString()}</td><td>PAYOUT{String(row.id).padStart(4,"0")}</td><td>{row.supplier.name}<small>{row.supplier.mobile}</small></td><td>{row.paymentMethod}</td><td>{row.reference||"-"}</td><td className="font-bold">{money(row.amount)}</td><td className="whitespace-nowrap"><button className="link" onClick={()=>setViewOut(row)}>View</button><button className="link ml-3" onClick={()=>{setEditOutId(row.id);setOutForm({supplierId:String(row.supplierId),amount:Number(row.amount),paymentDate:new Date(row.paymentDate).toISOString().slice(0,10),paymentMethod:row.paymentMethod,reference:row.reference||"",notes:row.notes||""});window.scrollTo({top:0,behavior:"smooth"})}}>Edit</button><button className="link ml-3" onClick={()=>erp.openSupplierPaymentReceipt(row.id)}>Print</button><button className="link ml-3 text-red-600" onClick={async()=>{if(confirm("Delete this supplier payment?")){try{await erp.deleteSupplierPayment(row.id);await load()}catch(e){setError(e.response?.data?.message||"Could not delete payment")}}}}>Delete</button></td></tr>)}{!paymentOut.length&&<tr><td colSpan="7" className="text-center">No supplier payments recorded.</td></tr>}</tbody></table></div>{viewOut&&<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onClick={()=>setViewOut(null)}><section className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={e=>e.stopPropagation()}><button className="btn-secondary float-right" onClick={()=>setViewOut(null)}>Close</button><h2 className="text-2xl font-bold">Payment Out</h2><dl className="mt-5 grid grid-cols-2 gap-4"><div><dt>Supplier</dt><dd className="font-bold">{viewOut.supplier.name}</dd></div><div><dt>Amount</dt><dd className="font-bold">{money(viewOut.amount)}</dd></div><div><dt>Date</dt><dd>{new Date(viewOut.paymentDate).toLocaleDateString()}</dd></div><div><dt>Method</dt><dd>{viewOut.paymentMethod}</dd></div><div><dt>Reference</dt><dd>{viewOut.reference||"-"}</dd></div><div><dt>Created by</dt><dd>{viewOut.createdBy?.name||"-"}</dd></div></dl>{viewOut.notes&&<p className="mt-4 rounded-lg bg-slate-50 p-3">{viewOut.notes}</p>}</section></div>}</>
      ) : (
        <>
          <form
            onSubmit={collect}
            className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4"
          >
            <div className="xl:col-span-2">
              <label className="text-sm">Search outstanding invoice</label>
              <input
                className="field"
                placeholder="Invoice, customer or mobile"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                required
                className="field mt-2"
                value={form.invoiceId}
                onChange={(event) => {
                  const invoice = invoices.find(
                    (row) => row.id === Number(event.target.value),
                  );
                  setForm({
                    ...form,
                    invoiceId: event.target.value,
                    amount: invoice ? Number(invoice.balance) : "",
                  });
                }}
              >
                <option value="">Select invoice</option>
                {outstanding.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceCode} - {invoice.customer.name} - Due{" "}
                    {money(invoice.balance)}
                  </option>
                ))}
              </select>
            </div>
            <label>
              Amount received
              <input
                required
                className="field"
                type="number"
                min="0.01"
                max={
                  selectedInvoice ? Number(selectedInvoice.balance) : undefined
                }
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
              />
              <small>Balance: {money(selectedInvoice?.balance)}</small>
            </label>
            <label>
              Method
              <select
                className="field"
                value={form.method}
                onChange={(event) =>
                  setForm({ ...form, method: event.target.value })
                }
              >
                {["CASH", "UPI", "CARD", "BANK"].map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </label>
            <label>
              Reference
              <input
                className="field"
                placeholder="UPI / bank reference"
                value={form.reference}
                onChange={(event) =>
                  setForm({ ...form, reference: event.target.value })
                }
              />
            </label>
            <label className="xl:col-span-2">
              Notes
              <input
                className="field"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </label>
            <div className="flex items-end">
              <button className="btn-primary" disabled={!form.invoiceId}>
                Collect payment
              </button>
            </div>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Collected by</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((paymentRow) => (
                  <tr key={paymentRow.id}>
                    <td>{new Date(paymentRow.paidAt).toLocaleString()}</td>
                    <td>RCT{String(paymentRow.id).padStart(4, "0")}</td>
                    <td>
                      {paymentRow.invoice.invoiceCode}
                      <small>Due {money(paymentRow.invoice.balance)}</small>
                    </td>
                    <td>
                      {paymentRow.invoice.customer?.name}
                      <small>{paymentRow.invoice.customer?.mobile}</small>
                    </td>
                    <td>
                      {paymentRow.method}
                      <small>{paymentRow.reference}</small>
                    </td>
                    <td>{paymentRow.createdBy?.name || "-"}</td>
                    <td className="font-bold">{money(paymentRow.amount)}</td>
                    <td className="whitespace-nowrap">
                      <button
                        className="link"
                        onClick={() => erp.openPaymentReceipt(paymentRow.id)}
                      >
                        Print receipt
                      </button>
                      <button
                        className="link ml-3"
                        onClick={async () =>
                          window.open(
                            (await erp.getPaymentWhatsApp(paymentRow.id)).url,
                            "_blank",
                          )
                        }
                      >
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
                {!payments.length && (
                  <tr>
                    <td colSpan="8" className="text-center text-slate-400">
                      No payments recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
