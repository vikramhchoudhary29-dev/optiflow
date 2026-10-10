import { useEffect, useState } from "react";
import ModuleHeader from "../../components/common/ModuleHeader";
import Alert from "../../components/common/Alert";
import * as erp from "../../services/erp.service";

const pendingTemplate = `Hello {customerName},

Thank you for choosing {shopName}. We have received your order successfully.

Invoice Number: {invoiceCode}
Total Amount: ₹{grandTotal}
Amount Received: ₹{received}
Balance Due: ₹{balance}

We will notify you as soon as your spectacles are ready.

Regards,
{shopName}`;
const readyTemplate = `Hello {customerName},

Good news! Your spectacles for Invoice {invoiceCode} are ready for collection from {shopName}.

Total Amount: ₹{grandTotal}
Amount Received: ₹{received}
Balance Due: ₹{balance}

Please visit us at {shopAddress}. For assistance, call {shopMobile}.

Regards,
{shopName}`;
const deliveredTemplate = `Hello {customerName}, your order from {shopName} has been delivered successfully. Thank you for choosing us. If you need any support or changes, please reply to this message. Invoice No: {invoiceCode}. We would love your feedback here: {reviewLink}`;

const empty = {
  shopName: "",
  address: "",
  mobile: "",
  gstNumber: "",
  reviewLink: "",
  invoicePrefix: "INV",
  customerPrefix: "CUS",
  prescriptionPrefix: "PRE",
  purchasePrefix: "PUR",
  currency: "INR",
  footerNote: "",
  terms: "",
  logoUrl: "",
  whatsappMessage: pendingTemplate,
  readyWhatsappMessage: readyTemplate,
  deliveredWhatsappMessage: deliveredTemplate,
};

export default function Settings() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    erp
      .getSettings()
      .then((d) =>
        setForm({
          ...empty,
          shopName: d.shopName || "",
          address: d.address || "",
          mobile: d.mobile || "",
          gstNumber: d.gstNumber || "",
          reviewLink: d.setting?.reviewLink || "",
          ...d.setting,
          whatsappMessage: d.notificationTemplate?.message || pendingTemplate,
          readyWhatsappMessage:
            d.notificationTemplate?.readyMessage || readyTemplate,
          deliveredWhatsappMessage:
            d.notificationTemplate?.deliveredMessage || deliveredTemplate,
        })
      )
      .catch((e) => setError(e.response?.data?.message || "Could not load settings"));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const data = await erp.updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setForm((current) => ({
        ...current,
        ...data.setting,
        reviewLink: data.setting?.reviewLink || current.reviewLink,
        whatsappMessage: data.notificationTemplate?.message || current.whatsappMessage,
        readyWhatsappMessage:
          data.notificationTemplate?.readyMessage || current.readyWhatsappMessage,
        deliveredWhatsappMessage:
          data.notificationTemplate?.deliveredMessage || current.deliveredWhatsappMessage,
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save settings");
    }
  };

  return (
    <div>
      <ModuleHeader
        title="Settings"
        description="Shop identity, numbering, tax, invoice and WhatsApp defaults."
      />
      <Alert error={error} />
      {saved && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700">
          Settings saved.
        </div>
      )}
      <form onSubmit={save} className="grid gap-5">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Shop information</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {["shopName", "mobile", "address", "gstNumber"].map((key) => (
              <input
                key={key}
                required={["shopName", "mobile"].includes(key)}
                className="field"
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={form[key] || ""}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            ))}
          </div>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Document numbering</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {["invoicePrefix", "customerPrefix", "prescriptionPrefix", "purchasePrefix"].map(
              (key) => (
                <input
                  key={key}
                  required
                  className="field"
                  placeholder={key}
                  value={form[key] || ""}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              )
            )}
          </div>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Invoice & template settings</h2>
          <div className="grid gap-4">
            <input
              className="field"
              placeholder="Footer note"
              value={form.footerNote || ""}
              onChange={(event) =>
                setForm({ ...form, footerNote: event.target.value })
              }
            />
            <input
              className="field"
              placeholder="Review link"
              value={form.reviewLink || ""}
              onChange={(event) =>
                setForm({ ...form, reviewLink: event.target.value })
              }
            />
            <textarea
              className="field min-h-24"
              placeholder="Terms"
              value={form.terms || ""}
              onChange={(event) =>
                setForm({ ...form, terms: event.target.value })
              }
            />
            <label>
              <span className="mb-1 block font-semibold">Order received message</span>
              <small className="mb-2 block text-slate-500">
                Used automatically when delivery status is Pending.
              </small>
              <textarea
                required
                className="field min-h-52"
                value={form.whatsappMessage}
                onChange={(event) =>
                  setForm({ ...form, whatsappMessage: event.target.value })
                }
              />
            </label>
            <label>
              <span className="mb-1 block font-semibold">Order ready message</span>
              <small className="mb-2 block text-slate-500">
                Used automatically when delivery status is Ready.
              </small>
              <textarea
                required
                className="field min-h-52"
                value={form.readyWhatsappMessage}
                onChange={(event) =>
                  setForm({ ...form, readyWhatsappMessage: event.target.value })
                }
              />
            </label>
            <label>
              <span className="mb-1 block font-semibold">Order delivered message</span>
              <small className="mb-2 block text-slate-500">
                Used automatically when delivery status is Delivered.
              </small>
              <textarea
                required
                className="field min-h-52"
                value={form.deliveredWhatsappMessage}
                onChange={(event) =>
                  setForm({
                    ...form,
                    deliveredWhatsappMessage: event.target.value,
                  })
                }
              />
            </label>
            <p className="text-xs text-slate-500">
              Available variables: {"{customerName}"}, {"{invoiceCode}"}, {"{shopName}"}, {"{grandTotal}"}, {"{received}"}, {"{balance}"}, {"{deliveryStatus}"}, {"{shopAddress}"}, {"{shopMobile}"}, {"{reviewLink}"}
            </p>
          </div>
        </section>
        <button className="btn-primary w-fit">Save settings</button>
      </form>
    </div>
  );
}
