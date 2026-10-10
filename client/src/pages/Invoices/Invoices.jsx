import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import { createCustomer } from "../../services/customer.service";
import * as erp from "../../services/erp.service";
import useAuth from "../../hooks/useAuth";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const blankPrescription = {
  rightSph: "",
  rightCyl: "",
  rightAxis: "",
  rightAdd: "",
  leftSph: "",
  leftCyl: "",
  leftAxis: "",
  leftAdd: "",
  pdDistance: "",
  pdNear: "",
  doctorName: "",
  doctorNotes: "",
};
const blankItem = {
  categoryId: "",
  name: "",
  brand: "",
  barcode: "",
  purchasePrice: "",
  sellingPrice: "",
  openingStock: 1,
};
const localDateInput = (value = new Date()) => {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const fresh = () => ({
  customerId: "",
  invoiceDate: localDateInput(),
  discount: 0,
  gstRate: 0,
  amountPaid: 0,
  paymentMethod: "CASH",
  loyaltyPointsToRedeem: 0,
  items: [],
  addPrescription: false,
  prescription: { ...blankPrescription },
});
const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

export default function Invoices() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(fresh());
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    address: "",
  });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newItem, setNewItem] = useState(blankItem);
  const [addingItem, setAddingItem] = useState(false);
  const [code, setCode] = useState("");
  const [match, setMatch] = useState(null);
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState("");
  const [loyalty, setLoyalty] = useState(null);
  const [error, setError] = useState("");
  const [collecting, setCollecting] = useState(null);
  const [payment, setPayment] = useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
  });
  const codeRef = useRef();

  const load = async () => {
    try {
      const [invoiceRows, customerRows, productRows, categoryRows] =
        await Promise.all([
          erp.listInvoices(),
          erp.listCustomers(),
          erp.listProducts(),
          erp.listCategories(),
        ]);
      setInvoices(invoiceRows);
      setCustomers(customerRows.filter((item) => item.active));
      setProducts(productRows.filter((item) => item.active));
      setCategories(categoryRows.filter((item) => item.active));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load invoices",
      );
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const invoiceId = Number(searchParams.get("invoiceId"));
    if (!invoiceId) return;
    let cancelled = false;
    erp.getInvoice(invoiceId).then((invoice) => {
      if (!cancelled) setSelected(invoice);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [searchParams]);
  useAutoRefresh(load, { enabled: !show && !collecting });
  useEffect(() => {
    if (form.customerId)
      erp
        .getCustomerLoyalty(form.customerId)
        .then(setLoyalty)
        .catch(() => setLoyalty(null));
    else setLoyalty(null);
  }, [form.customerId]);

  const customer = customers.find(
    (item) => item.id === Number(form.customerId),
  );
  const matches = query.trim()
    ? customers
        .filter((item) =>
          `${item.name} ${item.mobile}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 8)
    : [];
  const subtotal = useMemo(
    () =>
      form.items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      ),
    [form.items],
  );
  const taxable = Math.max(0, subtotal - Number(form.discount || 0));
  const gst = (taxable * Number(form.gstRate || 0)) / 100;
  const loyaltyDiscount =
    Number(form.loyaltyPointsToRedeem || 0) *
    Number(loyalty?.setting?.redemptionValuePerPoint || 0);
  const total = Math.max(0, taxable + gst - loyaltyDiscount);

  const reset = () => {
    setForm(fresh());
    setEditId(null);
    setSaved(null);
    setCode("");
    setMatch(null);
    setRate("");
    setQuery("");
    setAddingItem(false);
  };

  const find = () => {
    const value = code.trim().toLowerCase();
    const product = products.find(
      (item) =>
        String(item.sku || "").toLowerCase() === value ||
        String(item.barcode || "").toLowerCase() === value,
    );
    if (!product) return setError(`No product found for item code "${code}"`);
    setMatch(product);
    setQty(1);
    setRate(String(Number(product.sellingPrice)));
    setError("");
  };

  const add = () => {
    if (!match) return find();
    const quantity = Number(qty);
    const sellingRate = Number(rate);
    const old = form.items.find((item) => item.productId === match.id);
    const combined = quantity + (old?.quantity || 0);
    if (!Number.isFinite(sellingRate) || sellingRate <= 0)
      return setError("Enter a valid selling price");
    if (combined > match.stock + (editId ? old?.originalQuantity || 0 : 0))
      return setError(`Insufficient stock for ${match.name}`);
    const line = {
      productId: match.id,
      code: match.sku,
      name: match.name,
      quantity: combined,
      price: sellingRate,
      stock: match.stock,
      originalQuantity: old?.originalQuantity || 0,
    };
    setForm({
      ...form,
      items: old
        ? form.items.map((item) => (item.productId === match.id ? line : item))
        : [...form.items, line],
    });
    setCode("");
    setMatch(null);
    setQty(1);
    setRate("");
    requestAnimationFrame(() => codeRef.current?.focus());
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setSavingInvoice(true);
      const body = {
        customerId: Number(form.customerId),
        discount: Number(form.discount || 0),
        gst,
        loyaltyPointsToRedeem: Number(form.loyaltyPointsToRedeem || 0),
        items: form.items.map((item) => ({
          productId: item.productId,
          itemCode: item.code,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        prescription: form.addPrescription ? form.prescription : undefined,
        invoiceDate: form.invoiceDate || localDateInput(),
        amountPaid: Number(form.amountPaid || 0),
        paymentMethod: form.paymentMethod,
      };
      const invoice = editId
        ? await erp.updateInvoice(editId, body)
        : await erp.createInvoice(body);
      setSaved(invoice);
      await load();
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save invoice",
      );
    } finally {
      setSavingInvoice(false);
    }
  };

  const edit = async (id) => {
    try {
      const invoice = await erp.getInvoice(id);
      const taxableRate = Number(invoice.subTotal) - Number(invoice.discount);
      const gstRate = taxableRate
        ? (Number(invoice.gst) / taxableRate) * 100
        : 0;
      setForm({
        customerId: String(invoice.customerId),
        discount: Number(invoice.discount),
        gstRate,
        invoiceDate: localDateInput(invoice.invoiceDate),
        amountPaid: Number(invoice.advance ?? 0),
        paymentMethod: invoice.paymentMethod || "CASH",
        loyaltyPointsToRedeem: invoice.loyaltyPointsRedeemed || 0,
        items: invoice.invoiceitem.map((item) => ({
          productId: item.productId,
          code: item.itemCode,
          name: item.itemName,
          quantity: item.quantity,
          price: Number(item.price),
          stock: item.product?.stock || 0,
          originalQuantity: item.quantity,
        })),
        addPrescription: Boolean(invoice.prescription),
        prescription: invoice.prescription
          ? Object.fromEntries(
              Object.keys(blankPrescription).map((key) => [
                key,
                invoice.prescription[key] ?? "",
              ]),
            )
          : { ...blankPrescription },
      });
      setEditId(invoice.id);
      setShow(true);
      setSaved(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not edit invoice",
      );
    }
  };

  const addCustomer = async (event) => {
    event.preventDefault();
    try {
      const created = (await createCustomer(newCustomer)).data;
      setCustomers((items) => [...items, created]);
      setForm({ ...form, customerId: String(created.id) });
      setAddingCustomer(false);
      setNewCustomer({ name: "", mobile: "", address: "" });
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not add customer",
      );
    }
  };

  const addItem = async () => {
    try {
      const openingStock = Number(newItem.openingStock || 0);
      let product = await erp.createProduct({
        categoryId: Number(newItem.categoryId),
        name: newItem.name.trim(),
        brand: newItem.brand.trim() || null,
        barcode: newItem.barcode.trim() || null,
        purchasePrice: Number(newItem.purchasePrice || 0),
        sellingPrice: Number(newItem.sellingPrice),
        minimumStock: 0,
      });
      if (openingStock > 0)
        product = await erp.adjustStock(product.id, {
          quantity: openingStock,
          notes: "Opening stock added during billing",
        });
      setProducts((items) => [...items, product]);
      setMatch(product);
      setCode(product.sku);
      setQty(1);
      setRate(String(Number(product.sellingPrice)));
      setNewItem(blankItem);
      setAddingItem(false);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not add item");
    }
  };

  const updateLine = (productId, changes) =>
    setForm({
      ...form,
      items: form.items.map((item) =>
        item.productId === productId ? { ...item, ...changes } : item,
      ),
    });
  const canDelete =
    user?.role === "OWNER" ||
    user?.permissions?.some(
      (permission) => permission.module === "sales" && permission.canDelete,
    );
  const removeInvoice = async (invoice) => {
    if (
      !window.confirm(
        `Delete invoice ${invoice.invoiceCode}? Product stock will be restored. This action cannot be undone.`,
      )
    )
      return;
    try {
      await erp.deleteInvoice(invoice.id);
      if (selected?.id === invoice.id) setSelected(null);
      if (editId === invoice.id) {
        reset();
        setShow(false);
      }
      await load();
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete invoice",
      );
    }
  };

  const openCollection = (invoice) => {
    setCollecting(invoice);
    setPayment({
      amount: Number(invoice.balance),
      method: "CASH",
      reference: "",
      notes: "",
    });
  };

  const collectPayment = async (event) => {
    event.preventDefault();
    try {
      await erp.createPayment({
        invoiceId: collecting.id,
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference || null,
        notes: payment.notes || null,
      });
      setCollecting(null);
      await load();
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not collect payment");
    }
  };

  return (
    <div>
      <ModuleHeader
        title="Sales & invoices"
        description="Create, view and edit invoices with item-code billing."
        action={
          <button
            className="btn-primary"
            onClick={() => {
              if (show) reset();
              setShow(!show);
            }}
          >
            {show ? "Close" : "New invoice"}
          </button>
        }
      />
      <Alert error={error} />
      {initialLoading && <div className="mb-5 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />Loading invoices, customers and products…</div>}
      {show && (
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          {saved ? (
            <div className="py-8 text-center">
              <h2 className="text-2xl font-bold">Invoice saved successfully</h2>
              <p>
                {saved.invoiceCode} · {money(saved.grandTotal)}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  className="btn-primary"
                  onClick={() => erp.openInvoicePdf(saved.id)}
                >
                  Print
                </button>
                <button className="btn-secondary" onClick={reset}>
                  New invoice
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={save}>
              <div className="mb-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div>
                  <label className="label">Customer</label>
                  {customer ? (
                    <div className="rounded-lg border bg-indigo-50 p-3">
                      <strong>{customer.name}</strong>
                      <small className="block">{customer.mobile}</small>
                      <button
                        type="button"
                        className="link"
                        onClick={() => setForm({ ...form, customerId: "" })}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        className="field"
                        placeholder="Search by name or mobile"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      <div className="max-h-40 overflow-auto">
                        {matches.map((item) => (
                          <button
                            type="button"
                            className="flex w-full justify-between border-b p-2"
                            key={item.id}
                            onClick={() =>
                              setForm({ ...form, customerId: String(item.id) })
                            }
                          >
                            <span>{item.name}</span>
                            <span>{item.mobile}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    className="link mt-2"
                    onClick={() => setAddingCustomer(!addingCustomer)}
                  >
                    + Add customer
                  </button>
                </div>
                <div>
                  <label className="label">Invoice date</label>
                  <input
                    className="field"
                    type="date"
                    required
                    value={form.invoiceDate || localDateInput()}
                    onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })}
                  />
                 
                </div>
              </div>
              {addingCustomer && (
                <div className="mb-5 grid gap-3 md:grid-cols-4">
                  <input
                    className="field"
                    placeholder="Name"
                    value={newCustomer.name}
                    onChange={(event) =>
                      setNewCustomer({
                        ...newCustomer,
                        name: event.target.value,
                      })
                    }
                  />
                  <input
                    className="field"
                    placeholder="Mobile"
                    value={newCustomer.mobile}
                    onChange={(event) =>
                      setNewCustomer({
                        ...newCustomer,
                        mobile: event.target.value,
                      })
                    }
                  />
                  <input
                    className="field"
                    placeholder="Address"
                    value={newCustomer.address}
                    onChange={(event) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: event.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={addCustomer}
                  >
                    Save customer
                  </button>
                </div>
              )}
              <div className="mb-5 rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="label">Scan / enter item code</label>
                  <button
                    type="button"
                    className="link"
                    onClick={() => setAddingItem(!addingItem)}
                  >
                    + Add new item
                  </button>
                </div>
                {addingItem && (
                  <div className="mb-4 grid gap-3 rounded-lg bg-indigo-50 p-4 md:grid-cols-4">
                    <select
                      required
                      className="field"
                      value={newItem.categoryId}
                      onChange={(event) =>
                        setNewItem({
                          ...newItem,
                          categoryId: event.target.value,
                        })
                      }
                    >
                      <option value="">Category</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      className="field"
                      placeholder="Product name"
                      value={newItem.name}
                      onChange={(event) =>
                        setNewItem({ ...newItem, name: event.target.value })
                      }
                    />
                    <input
                      className="field"
                      placeholder="Brand"
                      value={newItem.brand}
                      onChange={(event) =>
                        setNewItem({ ...newItem, brand: event.target.value })
                      }
                    />
                    <input
                      className="field"
                      placeholder="Barcode (optional)"
                      value={newItem.barcode}
                      onChange={(event) =>
                        setNewItem({ ...newItem, barcode: event.target.value })
                      }
                    />
                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Purchase price (optional)"
                      value={newItem.purchasePrice}
                      onChange={(event) =>
                        setNewItem({
                          ...newItem,
                          purchasePrice: event.target.value,
                        })
                      }
                    />
                    <input
                      required
                      className="field"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Selling price"
                      value={newItem.sellingPrice}
                      onChange={(event) =>
                        setNewItem({
                          ...newItem,
                          sellingPrice: event.target.value,
                        })
                      }
                    />
                    <input
                      required
                      className="field"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Opening stock"
                      value={newItem.openingStock}
                      onChange={(event) =>
                        setNewItem({
                          ...newItem,
                          openingStock: event.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={
                        !newItem.categoryId ||
                        !newItem.name.trim() ||
                        Number(newItem.sellingPrice) <= 0 ||
                        Number(newItem.openingStock) < 1
                      }
                      onClick={addItem}
                    >
                      Save & select item
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    ref={codeRef}
                    disabled={!form.customerId}
                    className="field font-mono"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setMatch(null);
                      setRate("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        match ? add() : find();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={match ? add : find}
                  >
                    {match ? "Add item" : "Find"}
                  </button>
                </div>
                {match && (
                  <div className="mt-3 grid items-center gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_2fr_1fr_1fr_1fr]">
                    <strong>{match.sku}</strong>
                    <span>{match.name}</span>
                    <span>Stock {match.stock}</span>
                    <label className="text-sm">
                      Qty
                      <input
                        className="field mt-1"
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(event) => setQty(event.target.value)}
                      />
                    </label>
                    <label className="text-sm">
                      Selling price
                      <input
                        className="field mt-1"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={rate}
                        onChange={(event) => setRate(event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="table-wrap mb-5">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Selling price</th>
                      <th>Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item) => (
                      <tr key={item.productId}>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>
                          <input
                            className="field max-w-24"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateLine(item.productId, {
                                quantity: Number(event.target.value),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="field max-w-36"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.price}
                            onChange={(event) =>
                              updateLine(item.productId, {
                                price: Number(event.target.value),
                              })
                            }
                          />
                        </td>
                        <td>{money(item.price * item.quantity)}</td>
                        <td>
                          <button
                            type="button"
                            className="link text-red-600"
                            onClick={() =>
                              setForm({
                                ...form,
                                items: form.items.filter(
                                  (line) => line.productId !== item.productId,
                                ),
                              })
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {form.items.length > 0 && (
                <section className="mb-5 rounded-xl border p-4">
                  <label className="mb-3 flex gap-2 font-bold">
                    <input
                      type="checkbox"
                      checked={form.addPrescription}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          addPrescription: event.target.checked,
                        })
                      }
                    />{" "}
                    Add prescription for this customer
                  </label>
                  {form.addPrescription && (
                    <div className="grid gap-3 md:grid-cols-4">
                      {Object.keys(blankPrescription).map((key) => (
                        <div
                          key={key}
                          className={
                            key === "doctorNotes" ? "md:col-span-2" : ""
                          }
                        >
                          <label className="text-xs text-slate-500">
                            {key.replace(/([A-Z])/g, " $1")}
                          </label>
                          <input
                            className="field"
                            type={
                              key.includes("Name") || key.includes("Notes")
                                ? "text"
                                : "number"
                            }
                            step="0.01"
                            value={form.prescription[key]}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                prescription: {
                                  ...form.prescription,
                                  [key]: event.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    Discount
                    <input
                      className="field"
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={(event) =>
                        setForm({ ...form, discount: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    GST %
                    <input
                      className="field"
                      type="number"
                      min="0"
                      value={form.gstRate}
                      onChange={(event) =>
                        setForm({ ...form, gstRate: event.target.value })
                      }
                    />
                  </label>
                  {loyalty?.setting?.enabled && (
                    <label>
                      Loyalty points ({loyalty.balance} available)
                      <input
                        className="field"
                        type="number"
                        min="0"
                        max={loyalty.balance}
                        value={form.loyaltyPointsToRedeem}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            loyaltyPointsToRedeem: event.target.value,
                          })
                        }
                      />
                    </label>
                  )}
                  <>
                      <label>
                        {editId ? "Advance payment" : "Amount received"}
                        <input
                          className="field"
                          type="number"
                          min="0"
                          max={total}
                          value={form.amountPaid}
                          onChange={(event) =>
                            setForm({ ...form, amountPaid: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Payment method
                        <select
                          className="field"
                          value={form.paymentMethod}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              paymentMethod: event.target.value,
                            })
                          }
                        >
                          {["CASH", "CARD", "UPI", "BANK"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                    </>
                </div>
                <div className="rounded-xl bg-slate-900 p-5 text-white">
                  <p className="flex justify-between">
                    <span>Subtotal</span>
                    <b>{money(subtotal)}</b>
                  </p>
                  <p className="flex justify-between">
                    <span>Discount</span>
                    <b>- {money(form.discount)}</b>
                  </p>
                  <p className="flex justify-between">
                    <span>GST</span>
                    <b>{money(gst)}</b>
                  </p>
                  {loyaltyDiscount > 0 && (
                    <p className="flex justify-between">
                      <span>Loyalty</span>
                      <b>- {money(loyaltyDiscount)}</b>
                    </p>
                  )}
                  <p className="mt-3 flex justify-between border-t pt-3 text-xl">
                    <span>Total</span>
                    <b>{money(total)}</b>
                  </p>
                  <button
                    className="btn-primary mt-5 w-full"
                    disabled={savingInvoice || !form.customerId || !form.items.length}
                  >
                    {savingInvoice ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />Saving invoice…</span> : editId ? "Update invoice" : "Save invoice"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <button
                    className="link"
                    onClick={async () =>
                      setSelected(await erp.getInvoice(invoice.id))
                    }
                  >
                    {invoice.invoiceCode}
                  </button>
                  <small>
                    {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </small>
                </td>
                <td>
                  {invoice.customer.name}
                  <small>{invoice.customer.mobile}</small>
                </td>
                <td>{money(invoice.grandTotal)}</td>
                <td>{money(invoice.balance)}</td>
                <td>{invoice.paymentStatus}</td>
                <td>
                  <select
                    className="field"
                    value={invoice.deliveryStatus}
                    onChange={async (event) => {
                      await erp.setDeliveryStatus(
                        invoice.id,
                        event.target.value,
                      );
                      await load();
                    }}
                  >
                    {["PENDING", "READY", "DELIVERED", "CANCELLED"].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      ),
                    )}
                  </select>
                </td>
                <td className="whitespace-nowrap">
                  <button className="link" onClick={() => edit(invoice.id)}>
                    Edit
                  </button>
                  <button
                    className="link ml-3"
                    onClick={() => erp.openInvoicePdf(invoice.id)}
                  >
                    Print
                  </button>
                  <button
                    className="link ml-3"
                    onClick={async () =>
                      window.open(
                        (await erp.getWhatsAppLink(invoice.id)).url,
                        "_blank",
                      )
                    }
                  >
                    WhatsApp
                  </button>
                  {Number(invoice.balance) > 0 && (
                    <button className="link ml-3" onClick={() => openCollection(invoice)}>
                      Collect
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="ml-3 text-red-600 hover:underline"
                      onClick={() => removeInvoice(invoice)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {collecting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onClick={() => setCollecting(null)}>
          <form className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onSubmit={collectPayment} onClick={(event) => event.stopPropagation()}>
            <h2 className="text-xl font-bold">Collect remaining payment</h2>
            <p className="mt-1 text-sm text-slate-500">{collecting.invoiceCode} - {collecting.customer.name}</p>
            <div className="mt-4 rounded-lg bg-slate-50 p-3"><span>Balance due</span><strong className="float-right">{money(collecting.balance)}</strong></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>Amount<input required className="field" type="number" min="0.01" max={Number(collecting.balance)} step="0.01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} /></label>
              <label>Method<select className="field" value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })}>{["CASH", "CARD", "UPI", "BANK"].map((method) => <option key={method}>{method}</option>)}</select></label>
              <label>Reference<input className="field" value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></label>
              <label>Notes<input className="field" value={payment.notes} onChange={(event) => setPayment({ ...payment, notes: event.target.value })} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setCollecting(null)}>Cancel</button><button className="btn-primary">Collect payment</button></div>
          </form>
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="btn-secondary float-right"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            <h2 className="text-xl font-bold">{selected.invoiceCode}</h2>
            <p>{selected.customer.name}</p>
            <div className="table-wrap mt-5">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Code</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.invoiceitem.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{item.itemCode}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.price)}</td>
                      <td>{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
