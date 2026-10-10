import { requireShopUser } from "./auth.middleware.js";

// Compatibility export for existing shop routes. New routes should import
// requireShopUser directly from auth.middleware.js.
export default requireShopUser;
