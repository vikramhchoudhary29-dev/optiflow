import { useEffect, useMemo, useState } from "react";
import {
  deletePrescription,
  getBulkPrescriptionPdf,
  getPrescriptionPdf,
  getPrescriptions,
} from "../../services/prescription.service";
import useAuth from "../../hooks/useAuth";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const show = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;
const dateText = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function lensName(prescription) {
  if (prescription.lens) return prescription.lens;
  const items = prescription.invoice?.[0]?.invoiceitem || [];
  return (
    items
      .filter(
        (item) =>
          item.itemType === "LENS" ||
          item.product?.category?.name?.toLowerCase().includes("lens"),
      )
      .map((item) => item.itemName)
      .join(", ") || "-"
  );
}

function EyeTable({ prescription }) {
  return (
    <table className="border border-black text-center text-sm">
      <thead>
        <tr>
          <th className="border border-black bg-slate-900 text-white">Eye</th>
          <th className="border border-black bg-slate-900 text-white">SPH</th>
          <th className="border border-black bg-slate-900 text-white">CYL</th>
          <th className="border border-black bg-slate-900 text-white">Axis</th>
          <th className="border border-black bg-slate-900 text-white">Add</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-black font-bold">Right (OD)</td>
          <td className="border border-black">{show(prescription.rightSph)}</td>
          <td className="border border-black">{show(prescription.rightCyl)}</td>
          <td className="border border-black">
            {show(prescription.rightAxis)}
          </td>
          <td className="border border-black">{show(prescription.rightAdd)}</td>
        </tr>
        <tr>
          <td className="border border-black font-bold">Left (OS)</td>
          <td className="border border-black">{show(prescription.leftSph)}</td>
          <td className="border border-black">{show(prescription.leftCyl)}</td>
          <td className="border border-black">{show(prescription.leftAxis)}</td>
          <td className="border border-black">{show(prescription.leftAdd)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    lens: "",
    status: "ALL",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canDelete =
    user?.role === "OWNER" ||
    user?.permissions?.some(
      (permission) =>
        permission.module === "prescriptions" && permission.canDelete,
    );

  async function removePrescription(prescription) {
    if (
      !window.confirm(
        `Delete prescription ${prescription.prescriptionCode}? The invoice will remain, but the prescription cannot be recovered.`,
      )
    )
      return;
    try {
      await deletePrescription(prescription.id);
      setPrescriptions((rows) =>
        rows.filter((row) => row.id !== prescription.id),
      );
      if (selected?.id === prescription.id) setSelected(null);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not delete prescription.",
      );
    }
  }

  const load = async () => {
    try {
      const response = await getPrescriptions();
      setPrescriptions(response?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  useAutoRefresh(load, { enabled: !selected });

  const lensOptions = useMemo(
    () =>
      [
        ...new Set(prescriptions.map(lensName).filter((name) => name !== "-")),
      ].sort(),
    [prescriptions],
  );
  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return prescriptions.filter((prescription) => {
      const searchable = [
        prescription.prescriptionCode,
        prescription.customer?.name,
        prescription.customer?.mobile,
        lensName(prescription),
        prescription.invoice?.[0]?.invoiceCode,
      ]
        .join(" ")
        .toLowerCase();
      const date = new Date(prescription.prescriptionDate);
      return (
        (!query || searchable.includes(query)) &&
        (!filters.lens || lensName(prescription) === filters.lens) &&
        (filters.status === "ALL" || prescription.status === filters.status) &&
        (!filters.from || date >= new Date(`${filters.from}T00:00:00`)) &&
        (!filters.to || date <= new Date(`${filters.to}T23:59:59`))
      );
    });
  }, [filters, prescriptions]);

  async function openPdf(prescription, download = false) {
    try {
      const blob = await getPrescriptionPdf(prescription.id);
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${prescription.prescriptionCode}.pdf`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not generate prescription PDF.",
      );
    }
  }

  async function openAllPdf(download = false) {
    if (!filtered.length)
      return setError("There are no filtered prescriptions to print.");
    try {
      setError("");
      const blob = await getBulkPrescriptionPdf(
        filtered.map((prescription) => prescription.id),
      );
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "optiflow-prescriptions.pdf";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not generate the combined prescription PDF.",
      );
    }
  }

  if (loading)
    return (
      <div className="grid min-h-72 place-items-center text-slate-500">
        Loading prescriptions...
      </div>
    );
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            All prescriptions saved automatically while creating invoices.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={!filtered.length}
            onClick={() => openAllPdf(true)}
          >
            Download All PDF
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!filtered.length}
            onClick={() => openAllPdf(false)}
          >
            Print All ({filtered.length})
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-red-700">{error}</div>
      )}
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
        <input
          className="field xl:col-span-2"
          placeholder="Search customer, mobile, Rx, invoice or lens"
          value={filters.search}
          onChange={(event) =>
            setFilters({ ...filters, search: event.target.value })
          }
        />
        <select
          className="field"
          value={filters.lens}
          onChange={(event) =>
            setFilters({ ...filters, lens: event.target.value })
          }
        >
          <option value="">All lenses</option>
          {lensOptions.map((lens) => (
            <option key={lens}>{lens}</option>
          ))}
        </select>
        <select
          className="field"
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value })
          }
        >
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          className="btn-secondary"
          type="button"
          onClick={() =>
            setFilters({
              search: "",
              lens: "",
              status: "ALL",
              from: "",
              to: "",
            })
          }
        >
          Clear filters
        </button>
        <label className="text-xs text-slate-500">
          From
          <input
            type="date"
            className="field mt-1"
            value={filters.from}
            onChange={(event) =>
              setFilters({ ...filters, from: event.target.value })
            }
          />
        </label>
        <label className="text-xs text-slate-500">
          To
          <input
            type="date"
            className="field mt-1"
            value={filters.to}
            onChange={(event) =>
              setFilters({ ...filters, to: event.target.value })
            }
          />
        </label>
        <div className="self-end text-sm text-slate-500 xl:col-span-3">
          Showing <strong className="text-slate-900">{filtered.length}</strong>{" "}
          of {prescriptions.length} prescriptions
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1450px]">
            <thead>
              <tr>
                <th rowSpan="2">Rx / Date</th>
                <th rowSpan="2">Customer</th>
                <th rowSpan="2">Lens</th>
                <th colSpan="4" className="border-x text-center">
                  Right Eye (OD)
                </th>
                <th colSpan="4" className="border-x text-center">
                  Left Eye (OS)
                </th>
                <th rowSpan="2">PD</th>
                <th rowSpan="2">Actions</th>
              </tr>
              <tr>
                <th>SPH</th>
                <th>CYL</th>
                <th>Axis</th>
                <th>Add</th>
                <th>SPH</th>
                <th>CYL</th>
                <th>Axis</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prescription) => (
                <tr key={prescription.id}>
                  <td>
                    <strong>{prescription.prescriptionCode}</strong>
                    <small>{dateText(prescription.prescriptionDate)}</small>
                  </td>
                  <td>
                    {prescription.customer?.name}
                    <small>{prescription.customer?.mobile}</small>
                  </td>
                  <td className="max-w-52">
                    {lensName(prescription)}
                    <small>
                      {prescription.invoice?.[0]?.invoiceCode || ""}
                    </small>
                  </td>
                  <td>{show(prescription.rightSph)}</td>
                  <td>{show(prescription.rightCyl)}</td>
                  <td>{show(prescription.rightAxis)}</td>
                  <td>{show(prescription.rightAdd)}</td>
                  <td>{show(prescription.leftSph)}</td>
                  <td>{show(prescription.leftCyl)}</td>
                  <td>{show(prescription.leftAxis)}</td>
                  <td>{show(prescription.leftAdd)}</td>
                  <td>
                    D: {show(prescription.pdDistance)}
                    <small>N: {show(prescription.pdNear)}</small>
                  </td>
                  <td className="whitespace-nowrap">
                    <button
                      className="link"
                      onClick={() => setSelected(prescription)}
                    >
                      View
                    </button>
                    <button
                      className="link ml-3"
                      onClick={() => openPdf(prescription)}
                    >
                      Print
                    </button>
                    <button
                      className="link ml-3"
                      onClick={() => openPdf(prescription, true)}
                    >
                      PDF
                    </button>
                    {canDelete && (
                      <button
                        className="ml-3 text-red-600 hover:underline"
                        onClick={() => removePrescription(prescription)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="14" className="py-12 text-center text-slate-400">
                    No prescriptions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4"
          onClick={() => setSelected(null)}
        >
          <article
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                  Optical prescription
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selected.prescriptionCode}
                </h2>
                <p className="text-sm text-slate-500">
                  {dateText(selected.prescriptionDate)}
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <p>
                <b>Customer:</b> {selected.customer?.name}
              </p>
              <p>
                <b>Mobile:</b> {selected.customer?.mobile}
              </p>
              <p>
                <b>Lens:</b> {lensName(selected)}
              </p>
              <p>
                <b>Doctor:</b> {selected.doctorName || "-"}
              </p>
            </div>
            <EyeTable prescription={selected} />
            <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <b>Distance PD:</b> {show(selected.pdDistance)}
              </p>
              <p>
                <b>Near PD:</b> {show(selected.pdNear)}
              </p>
              <p className="sm:col-span-2">
                <b>Remarks:</b> {selected.doctorNotes || "-"}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => openPdf(selected, true)}
              >
                Download A4 PDF
              </button>
              <button className="btn-primary" onClick={() => openPdf(selected)}>
                Open & Print
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
