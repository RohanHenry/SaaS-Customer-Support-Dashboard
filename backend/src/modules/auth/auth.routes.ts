import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { requireAuth } from "./auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { register, login, logout, me } from "./auth.controller.js";

const router = Router();

// Public routes — validate the body first, then run the controller.
router.post("/register", validateBody(registerSchema), asyncHandler(register));
router.post("/login", validateBody(loginSchema), asyncHandler(login));
router.post("/logout", asyncHandler(logout));

// Protected route — requireAuth runs before the controller.
router.get("/me", requireAuth, asyncHandler(me));

export default router;
