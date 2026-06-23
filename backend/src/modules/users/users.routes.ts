import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import * as userService from "./users.service.js";

const router = Router();

// All user routes are staff-only.
router.use(requireAuth, requireRole("ADMIN", "SUPPORT_AGENT"));

/** GET /api/users/agents — staff list for the assign-agent dropdown. */
router.get(
  "/agents",
  asyncHandler(async (_req: Request, res: Response) => {
    const agents = await userService.listAgents();
    res.status(200).json({ agents });
  })
);

/** GET /api/users/agents/workload — agents with assigned-ticket counts. */
router.get(
  "/agents/workload",
  asyncHandler(async (_req: Request, res: Response) => {
    const agents = await userService.listAgentWorkload();
    res.status(200).json({ agents });
  })
);

/** GET /api/users/customers — customer directory. */
router.get(
  "/customers",
  asyncHandler(async (_req: Request, res: Response) => {
    const customers = await userService.listCustomers();
    res.status(200).json({ customers });
  })
);

/**
 * GET /api/users/:id — a customer's profile + their tickets.
 * Declared LAST so it doesn't swallow the specific routes above.
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await userService.getCustomerProfile(req.params.id);
    res.status(200).json(profile);
  })
);

export default router;
