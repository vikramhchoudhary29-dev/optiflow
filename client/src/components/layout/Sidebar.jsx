import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../common/BrandLogo";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  ),
  crm: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0M18 8v6M21 11h-6"/></svg>
  ),
  prescriptions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></svg>
  ),
  suppliers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 19h18M5 19V8l7-4 7 4v11M9 19v-5h6v5M8 9h.01M12 9h.01M16 9h.01"/></svg>
  ),
  purchases: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 9H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h4"/></svg>
  ),
  expenses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h8"/></svg>
  ),
  payments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
  ),
  marketing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 11 15-6v14L3 13z"/><path d="M18 10h3v4h-3M6 14l1.5 6h3L9 15"/></svg>
  ),
  loyalty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/></svg>
  ),
  staff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z"/></svg>
  ),
};

const menuGroups = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", path: "/", icon: "dashboard", module: "dashboard" },
      { name: "CRM", path: "/crm", icon: "crm", module: "crm" },
    ],
  },
  {
    label: "CUSTOMERS",
    items: [
      { name: "Customers", path: "/customers", icon: "customers", module: "customers" },
      { name: "Prescriptions", path: "/prescriptions", icon: "prescriptions", module: "prescriptions" },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { name: "Categories", path: "/categories", icon: "categories", module: "categories" },
      { name: "Products", path: "/products", icon: "products", module: "products" },
      { name: "Suppliers", path: "/suppliers", icon: "suppliers", module: "suppliers" },
      { name: "Purchases", path: "/purchases", icon: "purchases", module: "purchases" },
    ],
  },
  {
    label: "SALES & FINANCE",
    items: [
      { name: "Sales", path: "/invoices", icon: "sales", module: "sales" },
      { name: "Expenses", path: "/expenses", icon: "expenses", module: "expenses" },
      { name: "Payments", path: "/payments", icon: "payments", module: "payments" },
      { name: "Reports", path: "/reports", icon: "reports", module: "reports" },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { name: "Marketing", path: "/marketing", icon: "marketing", module: "marketing" },
      { name: "Loyalty", path: "/loyalty", icon: "loyalty", module: "settings" },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { name: "Staff", path: "/staff", icon: "staff", ownerOnly: true },
      { name: "Settings", path: "/settings", icon: "settings", module: "settings" },
    ],
  },
];

function canView(user, item) {
  return (
    user?.role === "OWNER" ||
    (!item.ownerOnly &&
      user?.permissions?.some(
        (permission) =>
          permission.module === item.module && permission.canView,
      ))
  );
}

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && <button className="sidebar-backdrop" type="button" onClick={onClose} aria-label="Close menu" />}

      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <BrandLogo dark className="sidebar-logo-wrap" />
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <span />
            <span />
          </button>
        </div>

        <div className="sidebar-shop">
          <div className="sidebar-shop-icon">OF</div>
          <div className="min-w-0">
            <p className="sidebar-shop-name">OptiFlow Optical</p>
            <p className="sidebar-shop-location">Optical Shop ERP</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canView(user, item));
            if (!visibleItems.length) return null;

            return (
              <div className="sidebar-group" key={group.label}>
                <p className="sidebar-group-label">{group.label}</p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="sidebar-link-icon">{icons[item.icon]}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {String(user?.name || "U").trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="sidebar-user-name">{user?.name || "User"}</p>
              <p className="sidebar-user-role">{user?.role || "USER"}</p>
            </div>
          </div>

          <button type="button" onClick={logout} className="sidebar-logout">
            <span className="sidebar-logout-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
