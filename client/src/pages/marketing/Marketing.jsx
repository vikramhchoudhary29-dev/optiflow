import { useEffect, useMemo, useState } from "react";
import useAutoRefresh from "../../hooks/useAutoRefresh";

import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import * as erp from "../../services/erp.service";

const emptyTemplate = { name: "", message: "Hello {customerName}, we have a special offer for you at {shopName}. Contact us at {shopMobile}." };

export default function Marketing() {
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [allCustomers, allTemplates] = await Promise.all([erp.listCustomers(), erp.listMarketingTemplates()]);
      setCustomers(allCustomers.filter((item) => item.active));
      setTemplates(allTemplates);
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not load marketing data"); }
  }
  useEffect(() => { void load(); }, []);
  useAutoRefresh(load);

  const filtered = useMemo(() => customers.filter((item) => `${item.name} ${item.mobile} ${item.city || ""}`.toLowerCase().includes(search.toLowerCase())), [customers, search]);
  const selectedTemplate = templates.find((item) => item.id === Number(templateId));

  function chooseTemplate(value) {
    setTemplateId(value);
    setMessage(templates.find((item) => item.id === Number(value))?.message || "");
  }
  function toggleCustomer(id) {
    setSelectedCustomers((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  async function saveTemplate(event) {
    event.preventDefault();
    try {
      if (editId) await erp.updateMarketingTemplate(editId, templateForm);
      else await erp.createMarketingTemplate(templateForm);
      setTemplateForm(emptyTemplate); setEditId(null); setError(""); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not save template"); }
  }
  async function openWhatsApp(customerId) {
    try {
      const result = await erp.getMarketingLink({ customerId, templateId: templateId || undefined, message: message || undefined });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not open WhatsApp"); }
  }

  return <div>
    <ModuleHeader title="Marketing" description="Create reusable messages and contact selected customers through WhatsApp click-to-chat." />
    <Alert error={error} />
    <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1.3fr]">
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold">Marketing templates</h2>
        <p className="mb-4 text-sm text-slate-500">Available placeholders: {"{customerName}"}, {"{customerMobile}"}, {"{customerCity}"}, {"{shopName}"}, {"{shopMobile}"}</p>
        <form onSubmit={saveTemplate} className="space-y-3">
          <input required className="field" placeholder="Template name" value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} />
          <textarea required rows="6" className="field" value={templateForm.message} onChange={(event) => setTemplateForm({ ...templateForm, message: event.target.value })} />
          <div className="flex gap-2"><button className="btn-primary">{editId ? "Update template" : "Save template"}</button>{editId && <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setTemplateForm(emptyTemplate); }}>Cancel</button>}</div>
        </form>
        <div className="mt-5 space-y-2">{templates.map((template) => <div key={template.id} className="rounded-lg border border-slate-200 p-3"><strong>{template.name}</strong><p className="mt-1 line-clamp-2 text-sm text-slate-500">{template.message}</p><div className="mt-2"><button className="link" onClick={() => { setEditId(template.id); setTemplateForm({ name: template.name, message: template.message }); }}>Edit</button><button className="link ml-3 text-red-600" onClick={async () => { if (confirm(`Delete ${template.name}?`)) { await erp.deleteMarketingTemplate(template.id); await load(); } }}>Delete</button></div></div>)}</div>
      </section>
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Prepare campaign message</h2>
        <select className="field mb-3" value={templateId} onChange={(event) => chooseTemplate(event.target.value)}><option value="">Write a custom message</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
        <textarea rows="7" className="field" placeholder="Enter a marketing message" value={message} onChange={(event) => setMessage(event.target.value)} />
        {selectedTemplate && <p className="mt-1 text-xs text-slate-500">Editing this message here affects this campaign only. Use Update template to permanently change the saved template.</p>}
        <div className="mt-5 flex items-center justify-between"><h3 className="font-semibold">Select customers ({selectedCustomers.length})</h3><button className="link" onClick={() => setSelectedCustomers(selectedCustomers.length === filtered.length ? [] : filtered.map((item) => item.id))}>{selectedCustomers.length === filtered.length ? "Clear all" : "Select all shown"}</button></div>
        <input className="field my-3" placeholder="Search name, mobile or city" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">{filtered.map((customer) => <label key={customer.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 hover:bg-slate-50"><input type="checkbox" checked={selectedCustomers.includes(customer.id)} onChange={() => toggleCustomer(customer.id)} /><span className="flex-1"><strong>{customer.name}</strong><small className="block text-slate-500">{customer.mobile}{customer.city ? ` · ${customer.city}` : ""}</small></span>{selectedCustomers.includes(customer.id) && <button type="button" className="btn-secondary py-1 text-sm" disabled={!message.trim()} onClick={(event) => { event.preventDefault(); void openWhatsApp(customer.id); }}>Open WhatsApp</button>}</label>)}</div>
        <p className="mt-3 text-xs text-slate-500">WhatsApp requires you to review and send each message. OptiFlow does not use unofficial bulk automation.</p>
      </section>
    </div>
  </div>;
}
