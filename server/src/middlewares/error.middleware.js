const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  if (error.code === "P2002") { statusCode = 409; message = `A record with this ${error.meta?.target?.join(", ") || "value"} already exists`; }
  if (error.code === "P2003") { statusCode = 409; message = "This record is still referenced and cannot be deleted"; }
  if (process.env.NODE_ENV === "production" && statusCode === 500) message = "Internal Server Error";
  return res.status(statusCode).json({ success: false, message, data: null, errors: [] });
};
export default errorMiddleware;
