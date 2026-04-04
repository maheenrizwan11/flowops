import { Response } from 'express'
import { AuthRequest } from '../types/auth.types'
import { prisma } from '../lib/prisma'

export async function requesterDashboard(req: AuthRequest, res: Response) {
  const { orgId } = req.params
  const userId = req.user!.id

  const [draft, submitted, closed] = await Promise.all([
    prisma.request.findMany({ where: { organizationId: orgId, createdById: userId, status: 'DRAFT' } }),
    prisma.request.findMany({ where: { organizationId: orgId, createdById: userId, status: 'SUBMITTED' } }),
    prisma.request.findMany({
      where: { organizationId: orgId, createdById: userId, status: { in: ['APPROVED', 'REJECTED', 'CLOSED'] } }
    })
  ])
  res.json({ draft, submitted, closed })
}

export async function reviewerDashboard(req: AuthRequest, res: Response) {
  const { orgId } = req.params
  const userId = req.user!.id

  const [assignedToMe, pendingReview] = await Promise.all([
    prisma.request.findMany({
      where: { organizationId: orgId, assignedToId: userId, status: { in: ['UNDER_REVIEW', 'ESCALATED'] } },
      include: { createdBy: { select: { id: true, name: true } } }
    }),
    prisma.request.findMany({
      where: { organizationId: orgId, status: 'SUBMITTED', assignedToId: null },
      include: { createdBy: { select: { id: true, name: true } } }
    })
  ])
  res.json({ assignedToMe, pendingReview })
}

export async function adminDashboard(req: AuthRequest, res: Response) {
  const { orgId } = req.params

  const [memberCount, requests, recentActivity] = await Promise.all([
    prisma.organizationMember.count({ where: { organizationId: orgId } }),
    prisma.request.groupBy({
      by: ['status'],
      where: { organizationId: orgId },
      _count: { status: true }
    }),
    prisma.auditLog.findMany({
      where: { request: { organizationId: orgId } },
      include: {
        user: { select: { id: true, name: true } },
        request: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  const requestsByStatus = requests.reduce((acc, r) => {
    acc[r.status] = r._count.status
    return acc
  }, {} as Record<string, number>)

  res.json({ memberCount, requestsByStatus, recentActivity })
}