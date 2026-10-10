import { useEffect, useState } from "react";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import Alert from "../../components/common/Alert";
import ExcelImport from "../../components/common/ExcelImport";
import ModuleHeader from "../../components/common/ModuleHeader";
import * as erp from "../../services/erp.service";

const empty = { name: "", mobile: "", email: "", address: "", notes: "" };
export default function Suppliers() {
  const [items, setItems] = useState([]), [form, setForm] = useState(empty), [editId, setEditId] = useState(null), [error, setError] = useState("");
  async function load() { try { setItems(await erp.listSuppliers()); } catch (requestError) { setError(requestError.response?.data?.message || "Could not load suppliers"); } }
  useEffect(() => { void load(); }, []);
  useAutoRefresh(load, { enabled: !editId });
  async function save(event) { event.preventDefault(); try { if (editId) await erp.updateSupplier(editId, form); else await erp.createSupplier(form); setForm(empty); setEditId(null); setError(""); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not save supplier"); } }
  return <div>
    <ModuleHeader title="Suppliers" description="Maintain vendors used by purchase entries." action={<ExcelImport type="suppliers" onImported={load} onError={setError} />} />
    <Alert error={error} />
    <form onSubmit={save} className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-3">{Object.keys(empty).map((field) => <input key={field} required={field === "name"} className="field" placeholder={field[0].toUpperCase() + field.slice(1)} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />)}<div className="flex gap-2"><button className="btn-primary">{editId ? "Update" : "Add supplier"}</button>{editId && <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}</div></form>
    <div className="table-wrap"><table><thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.mobile || "—"}</td><td>{item.email || "—"}</td><td>{item.address || "—"}</td><td><button className="link" onClick={() => { setEditId(item.id); setForm(Object.fromEntries(Object.keys(empty).map((field) => [field, item[field] || ""]))); }}>Edit</button><button className="link ml-3 text-red-600" onClick={async () => { if (confirm(`Delete ${item.name}?`)) { try { await erp.deleteSupplier(item.id); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Delete failed"); } } }}>Delete</button></td></tr>)}</tbody></table></div>
  </div>;
}
