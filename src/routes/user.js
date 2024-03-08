import { Router } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import Users from "../models/user.model.js";
import UserController from "../controllers/user.controller.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user = req?.user;

    if (!user) {
      return sendErrorResponse(res, 401, null, "Unauthorized.");
    }

    const userDetails = await UserController.getUserDetails(user._id);

    if (!userDetails) {
      return sendErrorResponse(res, 401, null, "Unauthorized.");
    }

    return sendSuccessResponse(
      res,
      200,
      {
        email: userDetails.email,
        tokens: userDetails.tokens,
      },
      "User details."
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

export default router;
