import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import useAuth from "../hooks/useAuth";

const pageTitles = {
  "/": "Dashboard",
  "/crm": "CRM",
  "/customers": "Customers",
  "/prescriptions": "Prescriptions",
  "/categories": "Categories",
  "/products": "Products",
  "/suppliers": "Suppliers",
  "/purchases": "Purchases",
  "/invoices": "Sales",
  "/expenses": "Expenses",
  "/payments": "Payments",
  "/reports": "Reports",
  "/marketing": "Marketing",
  "/loyalty": "Loyalty",
  "/staff": "Staff",
  "/settings": "Settings",
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];

  if (pathname.startsWith("/customers/")) return "Customer";
  if (pathname.startsWith("/prescriptions/")) return "Prescription";

  return "OptiFlow";
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [sidebarOpen]);

  const isDashboard = location.pathname === "/";

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {user?.isSupport && (
        <div className="support-banner">
          <span>
            Support mode: viewing {user.shopName} as owner. Session expires
            automatically in 30 minutes.
          </span>

          <button
            type="button"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");

                await fetch(
                  `${
                    import.meta.env.VITE_API_URL ||
                    (import.meta.env.PROD
                      ? "/api"
                      : "http://localhost:5000/api")
                  }/shop/support/end`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
              } finally {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.close();
                window.location.href = "/platform";
              }
            }}
          >
            End support session
          </button>
        </div>
      )}

      <div className="app-main">
        {/* 
          Global topbar is intentionally shown only on the main Dashboard.
          Other modules like CRM, Customers, Products, etc. use their own
          section headers and should not show this global header.
        */}
        {isDashboard && (
          <header className="app-topbar">
            <div className="app-topbar-left">
              <button
                type="button"
                className="mobile-menu-button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
              >
                <span />
                <span />
                <span />
              </button>

              <div>
                <p className="app-breadcrumb">OptiFlow ERP</p>

                <h1 className="app-page-title">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
            </div>

            <div
              className="app-topbar-credit"
              title="Designed and Developed by Arvik Digital – Vikram Choudhary"
            >
              <span className="app-topbar-credit-label">
                Designed &amp; Developed by
              </span>

              <strong>Arvik Digital</strong>

              <span className="app-topbar-credit-separator">
                –
              </span>

              <span>Vikram Choudhary</span>
            </div>
          </header>
        )}

        <main
          className="app-content page-transition"
          key={location.pathname}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}