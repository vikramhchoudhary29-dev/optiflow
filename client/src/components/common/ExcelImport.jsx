import { useRef, useState } from "react";

import { downloadImportTemplate, importExcel } from "../../services/erp.service";

export default function ExcelImport({ type, onImported, onError }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await importExcel(type, file);
      window.alert(`${result.imported} records imported successfully.`);
      await onImported?.();
    } catch (error) {
      onError?.(error.response?.data?.message || "Excel import failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return <div className="flex flex-wrap gap-2">
    <button type="button" className="btn-secondary" onClick={() => downloadImportTemplate(type)}>Download template</button>
    <button type="button" className="btn-secondary" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? "Importing…" : "Import Excel"}</button>
    <input ref={inputRef} className="hidden" type="file" accept=".xlsx" onChange={upload} />
  </div>;
}
