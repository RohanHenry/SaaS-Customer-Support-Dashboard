import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * GET /api/health
 * A lightweight "is the server alive?" endpoint.
 * Real companies use these for uptime monitors, load balancers, and deploy checks.
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "supportflow-backend",
    timestamp: new Date().toISOString(),
  });
});

export default router;
