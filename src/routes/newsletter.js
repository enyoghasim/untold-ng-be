import { Router } from "express";
import { sendErrorResponse } from "../utils/response.js";

const router = Router();

// router.post("/subscribe", async (req, res) => {
//   try {
//     return sendErrorResponse(res, 500, "An error occurred");
//   } catch (error) {}
// });
// router.post("/unsubscribe", async (req, res) => {
//   try {
//   } catch (error) {
//     return sendErrorResponse(res, 500, "An error occurred");
//   }
// });

export default router;
