import { Router } from "express";
import AuthRoute from "./auth.js";
import NewsLetterRoute from "./newsletter.js";
import StoryRoute from "./story.js";
import UserRoute from "./user.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/newsletter", NewsLetterRoute);
router.use("/story", StoryRoute);
router.use("/user", requireAuth, UserRoute);

export default router;
