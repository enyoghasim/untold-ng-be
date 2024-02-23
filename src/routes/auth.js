import { Router } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import isEmail from "validator/lib/isEmail.js";
import isHexadecimal from "validator/lib/isHexadecimal.js";
import Users from "../models/user.model.js";
import { guestOnly, requireAuth } from "../middlewares/auth.js";
import bcryptjs from "bcryptjs";
import ResetPasswordTokens from "../models/reset-password.model.js";
import Resend from "../emails/index.js";
import { forgotPasswordEmail } from "../emails/templates/index.js";
import UserController from "../controllers/user.controller.js";
import sessionStore from "../config/sessionStore.js";
import { generateRandomHexadecimalToken } from "../utils/helpers.js";

const router = Router();

router.post("/register", guestOnly, async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      return sendErrorResponse(
        res,
        400,
        null,
        "Email and password are required"
      );
    }

    if (!isEmail(email)) {
      return sendErrorResponse(res, 400, null, "Invalid email address");
    }

    email = email.trim().toLowerCase();

    if (password?.length < 6) {
      return sendErrorResponse(
        res,
        400,
        null,
        "Password must be at least 6 characters"
      );
    }

    const userWithEmailExists = await Users.findOne({ email });

    if (userWithEmailExists) {
      return sendErrorResponse(res, 400, null, "Email already exists");
    }

    const user = new Users({
      email,
      password: bcryptjs.hashSync(password, 10),
    });

    await user.save();

    return sendSuccessResponse(res, 201, null, "User created successfully");
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res);
  }
});

router.post("/login", guestOnly, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return sendErrorResponse(res, 401, null, "All fields are required");
    }

    if (password.length < 6) {
      return sendErrorResponse(res, 401, null, "Invalid credentials.");
    }

    const userDetails = await UserController.getUserDetails(req.body.email);

    if (!userDetails) {
      return sendErrorResponse(res, 401, null, "Invalid credentials.");
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      userDetails.password
    );

    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, null, "Invalid credentials.");
    }

    req.session.user = {
      _id: userDetails?._id,
    };

    if (userDetails.activeSession !== req.sessionID) {
      sessionStore.destroy(userDetails.activeSession);
    }

    userDetails.activeSession = req.sessionID;
    await userDetails.save();

    return sendSuccessResponse(res, 201, null, "Login successful.");
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res);
  }
});

router.get("/logout", requireAuth, (req, res) => {
  try {
    const user = req?.user;

    if (!user) {
      return sendErrorResponse(res, 401, null, "Unauthorized.");
    }

    return req.session.destroy((err) => {
      if (err) {
        return sendErrorResponse(res);
      }

      return sendSuccessResponse(res, 200, null, "Logout successful.");
    });
  } catch (error) {
    return sendErrorResponse(res);
  }
});

router.post("/update-password", requireAuth, async (req, res) => {
  try {
    const user = req?.user;

    if (!user) {
      return sendErrorResponse(res, 401, null, "Unauthorized.");
    }

    const { password, confirmPassword, oldPassword } = req.body;

    if (!password?.trim() || !confirmPassword?.trim() || !oldPassword?.trim()) {
      return sendErrorResponse(res, 401, null, "All fields are required.");
    }

    if (oldPassword.length < 6) {
      return sendErrorResponse(res, 401, null, "Invalid password.");
    }

    if (password.length < 6) {
      return sendErrorResponse(
        res,
        401,
        null,
        "Password must be at least 6 characters long."
      );
    }

    if (password !== confirmPassword) {
      return sendErrorResponse(res, 401, null, "Passwords do not match.");
    }

    const userDetails = await UserController.getUserDetails(user._id);

    if (!userDetails) {
      return sendErrorResponse(res, 404, null, "User not found.");
    }

    const isValid = await bcryptjs.compare(
      req.body.oldPassword,
      userDetails.password
    );

    if (!isValid) {
      return sendErrorResponse(res, 401, null, "Invalid old password.");
    }

    const salt = await bcryptjs.genSalt(10);

    userDetails.password = await bcryptjs.hash(password, salt);

    await userDetails.save();

    return sendSuccessResponse(
      res,
      200,
      null,
      "Password updated successfully."
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return sendErrorResponse(res, 401, null, "Email is required.");
    }

    if (!isEmail(email)) {
      return sendErrorResponse(res, 401, null, "Invalid email.");
    }

    const userDetails = await UserController.getUserDetails(req.body.email);

    if (!userDetails) {
      return sendErrorResponse(
        res,
        404,
        null,
        "User with that email does not exist."
      );
    }

    await ResetPasswordTokens.deleteMany({
      user: userDetails._id,
    });

    const selector = generateRandomHexadecimalToken();
    const token = generateRandomHexadecimalToken();

    const salt = await bcryptjs.genSalt(10);
    const hashedToken = await bcryptjs.hash(token, salt);

    const resetPasswordToken = await ResetPasswordTokens.create({
      user: userDetails._id,
      selector,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    });

    if (!resetPasswordToken) {
      return sendErrorResponse(
        res,
        500,
        null,
        "Error creating reset password token."
      );
    }
    sendSuccessResponse(
      res,
      200,
      null,
      "Password reset link sent successfully please check your email."
    );

    const resend = new Resend();

    await resend.sendEmail({
      to: [userDetails.email],
      from: "Untold.Ng <auth@emails.untold.ng>",
      subject: "Reset your password",
      html: forgotPasswordEmail({
        resetLink: `${process.env.FRONTEND_URL}/auth/reset-password/?selector=${selector}&token=${token}`,
      }),
    });
    return;
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res);
  }
});

router.post("/reset-password/:selector/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { selector, token } = req.params;

    if (!selector?.trim() || !token?.trim()) {
      return sendErrorResponse(res, 401, null, "All fields are required.");
    }

    if (!isHexadecimal(selector) || !isHexadecimal(token)) {
      return sendErrorResponse(res, 401, null, "Invalid password reset link");
    }

    if (!password?.trim() || !confirmPassword?.trim()) {
      return sendErrorResponse(res, 401, null, "All fields are required.");
    }

    if (password.length < 6) {
      return sendErrorResponse(
        res,
        401,
        null,
        "Password must be at least 6 characters long."
      );
    }

    if (password !== confirmPassword) {
      return sendErrorResponse(res, 401, null, "Passwords do not match.");
    }

    const resetPasswordToken = await ResetPasswordTokens.findOne({
      selector,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!resetPasswordToken) {
      return sendErrorResponse(res, 401, null, "Invalid password reset link");
    }

    const isTokenValid = await bcryptjs.compare(
      token,
      resetPasswordToken.token
    );

    if (!isTokenValid) {
      return sendErrorResponse(res, 401, null, "Invalid password reset link");
    }

    const userDetails = await UserController.getUserDetails(
      resetPasswordToken.user
    );

    if (!userDetails) {
      return sendErrorResponse(
        res,
        404,
        null,
        "User with that email does not exist."
      );
    }

    const salt = await bcryptjs.genSalt(10);

    userDetails.password = await bcryptjs.hash(password, salt);
    userDetails.activeSession = "";
    sessionStore.destroy(userDetails?.activeSession);

    await userDetails.save();

    await ResetPasswordTokens.deleteMany({
      user: userDetails._id,
    });

    return sendSuccessResponse(res, 200, null, "Password reset successfully.");
  } catch (error) {
    return sendErrorResponse(res);
  }
});

export default router;
