import { Role } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
