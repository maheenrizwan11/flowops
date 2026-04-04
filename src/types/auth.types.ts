import { Request } from 'express'
import { Role } from '@prisma/client'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string }
  membership?: { role: Role; organizationId: string }
}