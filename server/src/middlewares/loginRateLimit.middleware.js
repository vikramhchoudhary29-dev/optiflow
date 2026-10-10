const attempts = new Map();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

export default function loginRateLimit(req, res, next) {
  const key = `${req.ip}:${String(req.body?.email || "").toLowerCase()}`;
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return next();
  }
  if (current.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - current.startedAt)) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ success: false, message: "Too many login attempts. Please try again shortly." });
  }
  current.count += 1;
  return next();
}
