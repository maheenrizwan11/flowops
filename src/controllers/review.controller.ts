import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../types/auth.types'  

export async function startReview(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const reviewerId = req.user!.id

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, status: 'SUBMITTED' }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or not in SUBMITTED status' })

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.request.update({
      where: { id: requestId },
      data: { status: 'UNDER_REVIEW', assignedToId: reviewerId }
    })
    await tx.statusHistory.create({
      data: { requestId, changedById: reviewerId, fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW' }
    })
    await tx.auditLog.create({
      data: { action: 'REVIEW_STARTED', requestId, userId: reviewerId }
    })
    await tx.notification.create({
      data: {
        userId: request.createdById,
        requestId,
        type: 'STATUS_UPDATED',
        message: `Your request "${request.title}" is now under review.`
      }
    })
    return r
  })
  res.json(updated)
}

export async function approveRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const reviewerId = req.user!.id

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, status: 'UNDER_REVIEW', assignedToId: reviewerId }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or not assigned to you' })

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.request.update({
      where: { id: requestId },
      data: { status: 'APPROVED', closedAt: new Date() }
    })
    await tx.statusHistory.create({
      data: { requestId, changedById: reviewerId, fromStatus: 'UNDER_REVIEW', toStatus: 'APPROVED' }
    })
    await tx.auditLog.create({
      data: { action: 'REQUEST_APPROVED', requestId, userId: reviewerId }
    })
    await tx.notification.create({
      data: {
        userId: request.createdById,
        requestId,
        type: 'STATUS_UPDATED',
        message: `Your request "${request.title}" has been approved.`
      }
    })
    return r
  })
  res.json(updated)
}

export async function rejectRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const reviewerId = req.user!.id

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, status: 'UNDER_REVIEW', assignedToId: reviewerId }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or not assigned to you' })

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.request.update({
      where: { id: requestId },
      data: { status: 'REJECTED', closedAt: new Date() }
    })
    await tx.statusHistory.create({
      data: { requestId, changedById: reviewerId, fromStatus: 'UNDER_REVIEW', toStatus: 'REJECTED' }
    })
    await tx.auditLog.create({
      data: { action: 'REQUEST_REJECTED', requestId, userId: reviewerId }
    })
    await tx.notification.create({
      data: {
        userId: request.createdById,
        requestId,
        type: 'STATUS_UPDATED',
        message: `Your request "${request.title}" has been rejected.`
      }
    })
    return r
  })
  res.json(updated)
}

export async function getAuditTrail(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const request = await prisma.request.findFirst({ where: { id: requestId, organizationId: orgId } })
  if (!request) return res.status(404).json({ error: 'Request not found' })

  const [auditLogs, statusHistory] = await Promise.all([
    prisma.auditLog.findMany({
      where: { requestId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.statusHistory.findMany({
      where: { requestId },
      include: { changedBy: { select: { id: true, name: true } } },
      orderBy: { changedAt: 'asc' }
    })
  ])
  res.json({ auditLogs, statusHistory })
}
