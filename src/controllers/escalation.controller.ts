import { Response } from 'express'
import { AuthRequest } from '../types/auth.types'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const escalateSchema = z.object({
  assigneeId: z.string(),
  reason: z.string().optional()
})

export async function escalateRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const parsed = escalateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { assigneeId, reason } = parsed.data

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or cannot be escalated' })

  const assigneeMembership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: assigneeId } }
  })
  if (!assigneeMembership || !['REVIEWER', 'ADMIN'].includes(assigneeMembership.role)) {
    return res.status(400).json({ error: 'Assignee must be a REVIEWER or ADMIN in this organization' })
  }

  const previousAssigneeId = request.assignedToId

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.request.update({
      where: { id: requestId },
      data: { status: 'ESCALATED', assignedToId: assigneeId }
    })
    await tx.statusHistory.create({
      data: {
        requestId, changedById: req.user!.id,
        fromStatus: request.status, toStatus: 'ESCALATED',
        note: reason
      }
    })
    await tx.auditLog.create({
      data: {
        action: 'REQUEST_ESCALATED',
        requestId,
        userId: req.user!.id,
        metadata: { previousAssigneeId, newAssigneeId: assigneeId, reason }
      }
    })
    await tx.notification.create({
      data: {
        userId: assigneeId,
        requestId,
        type: 'REQUEST_ESCALATED',
        message: `Request "${request.title}" has been escalated and assigned to you.`
      }
    })
    return r
  })
  res.json(updated)
}