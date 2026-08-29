function errorHandler(err, req, res, next) {
  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "A record with that unique value already exists",
      fields: Object.keys(err.keyPattern || {})
    });
  }

  console.error(err);
  return res.status(err.statusCode || 500).json({
    message: err.message || "Unexpected server error"
  });
}

module.exports = errorHandler;
