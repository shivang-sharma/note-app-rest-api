import type { Request, Response, NextFunction } from "express";
import { generate } from "short-uuid";
export function correlationId(req: Request, res: Response, next: NextFunction) {
    res.setHeader("X-CorrelationId", generate());
    next();
}
