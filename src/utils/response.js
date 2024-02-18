// interface ErrorResponseData {
//   message: string;
// }

export function sendSuccessResponse(res, status, data = null, message = "") {
  return res.status(status).json({
    status: "success",
    message: message || "Request successful",
    data,
  });
}

export function sendErrorResponse(res, statusCode, errors = null, message) {
  return res.status(statusCode || 500).json({
    status: "error",
    message: message || "Internal Server Error",
    errors,
  });
}
