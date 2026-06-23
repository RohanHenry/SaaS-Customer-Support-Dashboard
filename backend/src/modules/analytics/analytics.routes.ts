import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { AppError } from "../../utils/AppError.js";
import { getOverview } from "./analytics.service.js";

const router = Router();

router.use(requireAuth);

/** GET /api/analytics/overview — metrics + chart data + recent activity. */
router.get(
  "/overview",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("You must be logged in", 401);
    const overview = await getOverview(req.user);
    res.status(200).json(overview);
  })
);

export default router;
