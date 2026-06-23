import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import * as ticketService from "./tickets.service.js";

/** Pull the authenticated actor off the request (requireAuth guarantees it). */
function getActor(req: Request) {
  if (!req.user) throw new AppError("You must be logged in", 401);
  return req.user;
}

export async function list(req: Request, res: Response): Promise<void> {
  // validateQuery stashed the parsed params here.
  const query = res.locals.query as Parameters<typeof ticketService.listTickets>[1];
  const result = await ticketService.listTickets(getActor(req), query);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.getTicketById(req.params.id, getActor(req));
  res.status(200).json({ ticket });
}

export async function create(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.createTicket(req.body, getActor(req));
  res.status(201).json({ ticket });
}

export async function update(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.updateTicket(
    req.params.id,
    req.body,
    getActor(req)
  );
  res.status(200).json({ ticket });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await ticketService.deleteTicket(req.params.id);
  res.status(204).send();
}

export async function comment(req: Request, res: Response): Promise<void> {
  const created = await ticketService.addComment(
    req.params.id,
    req.body.body,
    getActor(req)
  );
  res.status(201).json({ comment: created });
}
