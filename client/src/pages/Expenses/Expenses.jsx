import { useEffect, useState } from "react";
import useAutoRefresh from "../../hooks/useAutoRefresh";

import Alert from "../../components/common/Alert";
import ModuleHeader from "../../components/common/ModuleHeader";
import * as erp from "../../services/erp.service";

const emptyExpense = () => ({
  description: "",
  amount: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "CASH",
  notes: "",
});

export default function Expenses({ embedded = false }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyExpense());
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems(await erp.listExpenses());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load expenses",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);
  useAutoRefresh(load, { enabled: !editId });

  async function save(event) {
    event.preventDefault();
    try {
      if (editId) await erp.updateExpense(editId, form);
      else await erp.createExpense(form);
      setForm(emptyExpense());
      setEditId(null);
      setError("");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save expense",
      );
    }
  }

  return (
    <div>
      {!embedded && (
        <ModuleHeader
          title="Expenses"
          description="Record an expense, amount, date and payment details."
        />
      )}
      <Alert error={error} />
      <form
        onSubmit={save}
        className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm text-slate-600">Expense</label>
          <input
            required
            className="field"
            placeholder="Rent, electricity, salary…"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Amount</label>
          <input
            required
            min="0.01"
            type="number"
            step="0.01"
            className="field"
            placeholder="0.00"
            value={form.amount}
            onChange={(event) =>
              setForm({ ...form, amount: event.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Date</label>
          <input
            required
            type="date"
            className="field"
            value={form.expenseDate}
            onChange={(event) =>
              setForm({ ...form, expenseDate: event.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">
            Payment method
          </label>
          <select
            className="field"
            value={form.paymentMethod}
            onChange={(event) =>
              setForm({ ...form, paymentMethod: event.target.value })
            }
          >
            {["CASH", "CARD", "UPI", "BANK"].map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">
            Notes (optional)
          </label>
          <input
            className="field"
            placeholder="Additional details"
            value={form.notes}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
          />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn-primary">
            {editId ? "Update expense" : "Add expense"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(emptyExpense());
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense</th>
              <th>Method</th>
              <th>Notes</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.expenseDate).toLocaleDateString()}</td>
                <td>{item.description}</td>
                <td>{item.paymentMethod || "—"}</td>
                <td>{item.notes || "—"}</td>
                <td>₹{Number(item.amount).toFixed(2)}</td>
                <td>
                  <button
                    className="link"
                    onClick={() => {
                      setEditId(item.id);
                      setForm({
                        description: item.description,
                        amount: Number(item.amount),
                        expenseDate: item.expenseDate.slice(0, 10),
                        paymentMethod: item.paymentMethod || "CASH",
                        notes: item.notes || "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="link ml-3 text-red-600"
                    onClick={async () => {
                      if (confirm("Delete this expense?")) {
                        await erp.deleteExpense(item.id);
                        await load();
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
    </div>
  );
}
