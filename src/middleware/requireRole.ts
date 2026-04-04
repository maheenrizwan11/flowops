import { Role } from '@prisma/client'
import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/auth.types'


export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
