import { Role } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string }
      membership?: { role: Role; organizationId: string }
    }
  }
}
