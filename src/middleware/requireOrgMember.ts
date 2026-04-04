import { Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../types/auth.types'

export async function requireOrgMember(req: AuthRequest, res: Response, next: NextFunction) {
  const { orgId } = req.params
  const userId = req.user!.id

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } }
  })

  if (!membership) {
    return res.status(403).json({ error: 'You are not a member of this organization' })
  }

  req.membership = { role: membership.role, organizationId: orgId }
  next()
}
