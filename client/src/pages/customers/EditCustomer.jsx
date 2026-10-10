import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerForm from "../../components/customers/CustomerForm";

import {
  getCustomerById,
  updateCustomer,
} from "../../services/customer.service";

export default function EditCustomer() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const response = await getCustomerById(id);
        setCustomer(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customer.");
      } finally {
        setLoading(false);
      }
    }
    void loadCustomer();
  }, [id]);

  async function handleSubmit(data) {
    try {

      await updateCustomer(id, data);

      alert("Customer updated successfully.");

      navigate("/customers");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to update customer."
      );

    }
  }

  if (loading) {
    return (
      <h2 className="text-xl font-semibold">
        Loading Customer...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 className="text-red-600">
        {error}
      </h2>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Edit Customer
        </h1>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          onCancel={() =>
            navigate("/customers")
          }
        />

      </div>

    </div>
  );
}
