import asyncHandler from "../utils/asyncHandler.js";
import { loginShopUser } from "../services/shop.service.js";

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const result = await loginShopUser(identifier, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
    errors: null,
  });
});
