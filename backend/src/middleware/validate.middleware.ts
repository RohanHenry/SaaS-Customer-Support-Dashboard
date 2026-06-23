import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

/**
 * Returns middleware that validates req.body against a Zod schema.
 * If validation fails, it responds 400 with a field-by-field error map and the
 * controller never runs — so controllers can trust their input is well-formed.
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "form";
        fieldErrors[field] = issue.message;
      }
      res.status(400).json({ message: "Validation failed", errors: fieldErrors });
      return;
    }

    // Replace body with the parsed (and type-coerced) data.
    req.body = result.data;
    next();
  };
}

/**
 * Same idea for the query string (?search=&page=…). We can't reassign req.query
 * cleanly, so we stash the parsed result on res.locals — Express's per-request
 * scratchpad — and the controller reads it from there.
 */
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "query";
        fieldErrors[field] = issue.message;
      }
      res.status(400).json({ message: "Invalid query parameters", errors: fieldErrors });
      return;
    }

    res.locals.query = result.data;
    next();
  };
}
