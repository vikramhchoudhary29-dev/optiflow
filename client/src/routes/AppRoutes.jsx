import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import Customers from "../pages/customers/Customers";
import AddCustomer from "../pages/customers/AddCustomer";
import EditCustomer from "../pages/customers/EditCustomer";
import CustomerView from "../pages/customers/CustomerView";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";


import Products from "../pages/products/Products";
import Categories from "../pages/Categories/Categories";
import Suppliers from "../pages/suppliers/Suppliers";
import Expenses from "../pages/Expenses/Expenses";
import Payments from "../pages/Payments/Payments";
import Purchases from "../pages/Purchases/Purchases";
import Invoices from "../pages/Invoices/Invoices";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";
import Staff from "../pages/Staff/Staff";
import Marketing from "../pages/marketing/Marketing";
import Loyalty from "../pages/loyalty/Loyalty";
import CRM from "../pages/crm/CRM";
import Prescriptions from "../pages/prescriptions/Prescriptions";
import PlatformLogin from "../pages/Platform/PlatformLogin";
import PlatformDashboard from "../pages/Platform/PlatformDashboard";
import PlatformTools from "../pages/Platform/PlatformTools";


function RouteLoadingIndicator() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);
  if (!visible) return null;
  return <div className="fixed inset-x-0 top-0 z-[20000] h-1 overflow-hidden bg-violet-100/70" role="status" aria-label="Opening page"><div className="h-full w-1/3 animate-[route-progress_0.65s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500"/><style>{`@keyframes route-progress{0%{transform:translateX(-110%)}100%{transform:translateX(330%)}}`}</style></div>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteLoadingIndicator />
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={<Login />}
        />
        <Route path="/platform/login" element={<PlatformLogin />} />
        <Route path="/platform" element={<PlatformDashboard />} />
        <Route path="/platform/payments" element={<PlatformTools initialTab="payments" />} />
        <Route path="/platform/plans" element={<PlatformTools initialTab="plans" />} />
        <Route path="/platform/reminders" element={<PlatformTools initialTab="reminders" />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/customers/new"
            element={<AddCustomer />}
          />

          <Route
            path="/customers/:id/edit"
            element={<EditCustomer />}
          />

          <Route
            path="/customers/:id"
            element={<CustomerView />}
          />

          {/* Other Modules */}
         <Route path="/crm" element={<CRM />} />
          <Route path="/prescriptions" element={<Prescriptions />} />

          <Route
            path="/frames"
            element={<Navigate to="/products" replace />}
          />

          {/* Lens Master */}

<Route
  path="/lenses"
  element={<Navigate to="/products" replace />}
/>

<Route
  path="/lenses/new"
  element={<Navigate to="/products" replace />}
/>

<Route
  path="/lenses/:id/edit"
  element={<Navigate to="/products" replace />}
/>

          <Route
            path="/products"
            element={<Products />}
          />
          <Route
            path="/categories"
            element={<Categories />}
          />
          <Route
            path="/suppliers"
            element={<Suppliers />}
          />
          <Route path="/payments" element={<Payments />} />
          <Route path="/expenses" element={<Expenses />} />

          <Route
            path="/purchases"
            element={<Purchases />}
          />

          <Route
            path="/invoices"
            element={<Invoices />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route path="/staff" element={<Staff />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/loyalty" element={<Loyalty />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
