// this covers org.types.ts with the membership thing and no need for orgID separately cus its just req.params.orgId
import { Request } from 'express'
import { Role } from '@prisma/client'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string }
  membership?: { role: Role; organizationId: string }
}