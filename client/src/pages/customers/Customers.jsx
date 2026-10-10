import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCustomers,
  updateCustomerStatus,
} from "../../services/customer.service";
import ExcelImport from "../../components/common/ExcelImport";
import useAutoRefresh from "../../hooks/useAutoRefresh";

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase();

    setFilteredCustomers(
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(value) ||
          customer.mobile.includes(value) ||
          customer.customerCode.toLowerCase().includes(value)
      )
    );
  }, [search, customers]);

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await getCustomers();

      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  useAutoRefresh(loadCustomers);

  async function handleDelete(customer) {
    const confirmDelete = window.confirm(
      `Deactivate ${customer.name}?`
    );

    if (!confirmDelete) return;

    try {
      await updateCustomerStatus(
        customer.id,
        false
      );

      await loadCustomers();

      alert("Customer deactivated.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to deactivate customer."
      );
    }
  }

  if (loading) {
    return (
      <h2 className="text-xl font-semibold">
        Loading Customers...
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
    <div>
      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Customers
        </h1>

        <div className="flex gap-2">
          <ExcelImport type="customers" onImported={loadCustomers} onError={setError} />
          <button onClick={() => navigate("/customers/new")} className="btn-primary">+ Add Customer</button>
        </div>

      </div>

      {/* Search */}

      <div className="mb-5">

        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Code
              </th>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Mobile
              </th>

              <th className="p-4 text-left">
                City
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredCustomers.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500"
                >
                  No customers found.
                </td>

              </tr>

            ) : (

              filteredCustomers.map((customer) => (

                <tr
                  key={customer.id}
                  className="border-t hover:bg-slate-50 transition"
                >

                  <td className="p-4">
                    {customer.customerCode}
                  </td>

                  <td className="p-4">
                    {customer.name}
                  </td>

                  <td className="p-4">
                    {customer.mobile}
                  </td>

                  <td className="p-4">
                    {customer.city}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="text-indigo-600 hover:underline mr-4 font-medium"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/customers/${customer.id}/edit`)}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(customer)
                      }
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
