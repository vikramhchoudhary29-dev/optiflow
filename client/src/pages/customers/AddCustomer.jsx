import { useNavigate } from "react-router-dom";

import CustomerForm from "../../components/customers/CustomerForm";
import { createCustomer } from "../../services/customer.service";

export default function AddCustomer() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    try {
      await createCustomer(data);

      alert("Customer added successfully.");

      navigate("/customers");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create customer."
      );
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Add Customer
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/customers")}
        />
      </div>
    </div>
  );
}