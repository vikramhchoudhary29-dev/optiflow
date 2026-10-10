import { useNavigate } from "react-router-dom";

import PrescriptionForm from "../../components/prescriptions/PrescriptionForm";

import { createPrescription } from "../../services/prescription.service";

export default function AddPrescription() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    try {
      await createPrescription(data);

      alert("Prescription created successfully.");

      navigate("/prescriptions");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create prescription."
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          New Prescription
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <PrescriptionForm
          onSubmit={handleSubmit}
          onCancel={() =>
            navigate("/prescriptions")
          }
        />
      </div>
    </div>
  );
}