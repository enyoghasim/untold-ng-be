import { Router } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import { Resend } from "resend";
import isEmail from "validator/lib/isEmail.js";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    if (!req?.body?.email?.trim()) {
      return sendErrorResponse(res, 400, null, "Email is required");
    }
    if (!isEmail(req.body.email)) {
      return sendErrorResponse(res, 400, null, "Invalid email");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data } = await resend.contacts.create({
      email: req?.body?.email?.toLowerCase(),
      audienceId: process.env.RESEND_NEWSLETTER_AUDIENCE_ID,
    });

    if (!data) {
      return sendErrorResponse(res, 500, null, "An error occurred");
    }
    return sendSuccessResponse(res, 201, null, "Subscribed successfully");
  } catch (error) {
    return sendErrorResponse(res, 500, "An error occurred");
  }
});
// router.post("/unsubscribe", async (req, res) => {
//   try {
//   } catch (error) {
//     return sendErrorResponse(res, 500, "An error occurred");
//   }
// });

export default router;
