import { sendErrorResponse } from "../utils/response.js";
import UserController from "../controllers/user.controller.js";

export const requireAuth = async (req, res, next) => {
  try {
    if (req.session.user?._id) {
      const userDetails = await UserController.getUserDetails(
        req.session.user?._id
      );

      if (!userDetails) {
        return sendErrorResponse(res, 401, null, "Unauthorized.");
      }

      req.user = userDetails;
      return next();
    }
    return sendErrorResponse(res, 401, null, "Unauthorized.");
  } catch (error) {
    return sendErrorResponse(res, 401, null, "Unauthorized.");
  }
};

export const guestOnly = async (req, res, next) => {
  //   console.log(req.session);
  if (!req.session.user?._id) {
    return next();
  }

  const userDetails = await UserController.getUserDetails(
    req.session.user?._id
  );

  if (!userDetails) {
    return next();
  }

  return sendErrorResponse(res, 403, null, "Forbidden.");
};

export const allowEveryOne = async (req, res, next) => {
  if (req.session.user?._id) {
    const userDetails = await UserController.getUserDetails(
      req.session.user?._id
    );

    if (userDetails) {
      req.user = userDetails;
    }
  }

  return next();
};
