import type { NextFunction, Request, RequestHandler, Response } from 'express'

// Express 4 doesn't forward rejected promises from async handlers to error
// middleware on its own — this wrapper does that so Prisma failures return a
// proper 500 instead of hanging/crashing the process.
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
