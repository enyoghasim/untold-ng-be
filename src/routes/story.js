import { Router } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import isEmail from "validator/lib/isEmail.js";
import Resend from "../emails/index.js";

const router = Router();

router.post("/share", async (req, res) => {
  try {
    let { email, storyDetails } = req.body;

    if (!email || !storyDetails) {
      return sendErrorResponse(res, 400, null, "Email is required");
    }

    if (!isEmail(email)) {
      return sendErrorResponse(res, 400, null, "Invalid email");
    }

    if (storyDetails?.trim().length < 50) {
      return sendErrorResponse(res, 400, null, "story too short");
    }

    const resend = new Resend();

    await resend.sendEmail({
      to: process.env.ADMIN_STORY_EMAIL,
      from: `Untold.Ng - <stories@emails.untold.ng>`,
      subject: `New story from ${email}`,
      text: storyDetails,
    });

    sendSuccessResponse(
      res,
      200,
      null,
      "your story has been shared successfully, if it meets our guidelines you will be notified via email"
    );
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, 500, null, "An error occurred");
  }
});

export default router;
