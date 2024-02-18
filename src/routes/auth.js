import { Router } from "express";
import { sendErrorResponse } from "../utils/response.js";
import isEmail from "validator/lib/isEmail.js";
import isHexadecimal from "validator/lib/isHexadecimal.js";
import Users from "../models/user.model.js";
import { guestOnly, requireAuth } from "../middlewares/auth.js";
import bcryptjs from "bcryptjs";
import ResetPasswordTokens from "../models/reset-password.model.js";

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

    const userWithEmailExists = Users.findOne({ email });

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
    return sendErrorResponse(res);
  }
});

router.post("/login", guestOnly, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return sendErrorResponse(res, 401, null, "All fields are required");
    }

    if (password.length < 8) {
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

router.post("/forgot-password", (req, res) => {});

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
