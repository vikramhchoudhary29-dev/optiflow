import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../common/BrandLogo";

export default function Navbar() {
  const { logout, user } = useAuth();

  const menus = [
    { name: "Dashboard", path: "/", module: "dashboard" },
    { name: "Customers", path: "/customers", module: "customers" },
    { name: "Prescriptions", path: "/prescriptions", module: "prescriptions" },
    { name: "Categories", path: "/categories", module: "categories" },
    { name: "Products", path: "/products", module: "products" },
    { name: "Suppliers", path: "/suppliers", module: "suppliers" },
    { name: "Purchases", path: "/purchases", module: "purchases" },
    { name: "Sales", path: "/invoices", module: "sales" },
    { name: "Payments", path: "/payments", module: "payments" },
    { name: "Reports", path: "/reports", module: "reports" },
    { name: "Marketing", path: "/marketing", module: "marketing" },
    { name: "Loyalty", path: "/loyalty", module: "settings" },
    { name: "Staff", path: "/staff", ownerOnly: true },
    { name: "Settings", path: "/settings", module: "settings" },
  ];

  const canView = (menu) =>
    user?.role === "OWNER" ||
    (!menu.ownerOnly &&
      user?.permissions?.some(
        (permission) => permission.module === menu.module && permission.canView,
      ));

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          <NavLink to="/" className="shrink-0">
            <BrandLogo dark className="h-10 w-32" />
          </NavLink>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {menus.filter(canView).map((menu) => (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/"}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {menu.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 text-right lg:block">
            <p className="max-w-32 truncate text-sm font-semibold">
              {user?.name}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              {user?.role}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      {user?.isSupport && (
        <div className="sticky top-14 z-30 flex items-center justify-center gap-4 bg-amber-300 px-4 py-2 text-sm font-bold text-amber-950">
          Support mode: viewing {user.shopName} as owner. Session expires
          automatically in 30 minutes.
          <button
            className="rounded bg-amber-950 px-3 py-1 text-white"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await fetch(
                  `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api")}/shop/support/end`,
                  {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  },
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
    </>
  );
}
