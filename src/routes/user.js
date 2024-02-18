import { Router } from "express";
import { sendErrorResponse } from "../utils/response.js";
import Users from "../models/user.model.js";

const router = Router();

// router.get("/", async (req, res) => {
//   try {
//     const users = await Users.find();
//     return res.status(200).json({ users });
//   } catch (error) {
//     return sendErrorResponse(res);
//   }
// });

export default router;
