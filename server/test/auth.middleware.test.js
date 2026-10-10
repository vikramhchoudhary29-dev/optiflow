import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { requirePlatformAdmin, requireShopUser } from "../src/middlewares/auth.middleware.js";

process.env.JWT_SECRET = "test-only-secret";

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request(payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return { headers: { authorization: `Bearer ${token}` } };
}

test("platform guard accepts only platform tokens", () => {
  let called = false;
  const res = response();
  requirePlatformAdmin(request({ id: 1, tokenType: "PLATFORM_ADMIN" }), res, () => { called = true; });
  assert.equal(called, true);

  called = false;
  requirePlatformAdmin(request({ userId: 2, shopId: 3, role: "OWNER", tokenType: "SHOP_USER" }), res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
});

test("shop guard rejects typed tokens without a shop tenant", () => {
  let called = false;
  const res = response();
  requireShopUser(request({ userId: 2, tokenType: "SHOP_USER" }), res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
});

test("missing bearer token is rejected", () => {
  let called = false;
  const res = response();
  requireShopUser({ headers: {} }, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});
