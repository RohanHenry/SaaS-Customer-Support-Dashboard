import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  createTicketSchema,
  updateTicketSchema,
  addCommentSchema,
  listTicketsQuerySchema,
} from "./tickets.schemas.js";
import * as ticketController from "./tickets.controller.js";

const router = Router();

// Every ticket route requires a logged-in user.
router.use(requireAuth);

// List + create — any authenticated role (service scopes what they see).
router.get(
  "/",
  validateQuery(listTicketsQuerySchema),
  asyncHandler(ticketController.list)
);
router.post("/", validateBody(createTicketSchema), asyncHandler(ticketController.create));

// Single ticket — service enforces customer ownership.
router.get("/:id", asyncHandler(ticketController.getOne));

// Update (status/priority/assign) — staff only.
router.patch(
  "/:id",
  requireRole("ADMIN", "SUPPORT_AGENT"),
  validateBody(updateTicketSchema),
  asyncHandler(ticketController.update)
);

// Delete — admin only.
router.delete("/:id", requireRole("ADMIN"), asyncHandler(ticketController.remove));

// Comments — any role with access to the ticket.
router.post(
  "/:id/comments",
  validateBody(addCommentSchema),
  asyncHandler(ticketController.comment)
);

export default router;
