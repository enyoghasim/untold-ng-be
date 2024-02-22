import { Router } from "express";
import AuthRoute from "./auth.js";
import NewsLetterRoute from "./newsletter.js";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/newsletter", NewsLetterRoute);

export default router;
