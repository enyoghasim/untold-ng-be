import { Router } from "express";
import AuthRoute from "./auth.js";

const router = Router();

router.use("/auth", AuthRoute);

export default router;
