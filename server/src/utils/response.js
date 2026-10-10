/* ============================================================
   SUCCESS RESPONSE
============================================================ */

export function successResponse(
  res,
  message,
  data = null,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
}

/* ============================================================
   ERROR RESPONSE
============================================================ */

export function errorResponse(
  res,
  statusCode,
  message,
  errors = []
) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
}