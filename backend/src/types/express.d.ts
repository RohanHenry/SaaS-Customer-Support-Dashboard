import type { UserRole } from "@prisma/client";

/**
 * Tell TypeScript that our auth middleware adds a `user` property to every
 * Express request. After this, `req.user` is typed everywhere — no `as any`.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};
