import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PrescriptionForm from "../../components/prescriptions/PrescriptionForm";

import {
  getPrescriptionById,
  updatePrescription,
} from "../../services/prescription.service";

export default function EditPrescription() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrescription() {
      try {
        setLoading(true);
        const response = await getPrescriptionById(id);
        setPrescription(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load prescription.");
      } finally {
        setLoading(false);
      }
    }
    void loadPrescription();
  }, [id]);

  async function handleSubmit(data) {
    try {
      await updatePrescription(id, data);

      alert(
        "Prescription updated successfully."
      );

      navigate("/prescriptions");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update prescription."
      );
    }
  }

  if (loading) {
    return (
      <h2 className="text-xl font-semibold">
        Loading Prescription...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 className="text-red-600 font-semibold">
        {error}
      </h2>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Edit Prescription
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <PrescriptionForm
          initialData={prescription}
          onSubmit={handleSubmit}
          onCancel={() =>
            navigate("/prescriptions")
          }
        />
      </div>
    </div>
  );
}
