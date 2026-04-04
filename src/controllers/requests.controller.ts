import { Response } from 'express'
import { AuthRequest } from '../types/auth.types'
import { prisma } from '../lib/prisma'
import { notifyOrgRole } from '../utils/notifications'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1)
})

export async function createRequest(req: AuthRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { title, description, category } = parsed.data
  const { orgId } = req.params

  const request = await prisma.request.create({
    data: {
      title, description, category,
      organizationId: orgId,
      createdById: req.user!.id,
      status: 'DRAFT'
    }
  })
  res.status(201).json(request)
}

export async function listRequests(req: AuthRequest, res: Response) {
  const { orgId } = req.params
  const { status } = req.query
  const role = req.membership!.role
  const userId = req.user!.id

  const where: any = { organizationId: orgId }
  if (role === 'REQUESTER') where.createdById = userId
  if (role === 'REVIEWER') where.status = { notIn: ['DRAFT'] }
  if (status) where.status = status

  const requests = await prisma.request.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(requests)
}

export async function getRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params
  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      statusHistory: {
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { changedAt: 'asc' }
      }
    }
  })
  if (!request) return res.status(404).json({ error: 'Request not found' })
  res.json(request)
}

export async function updateRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, createdById: req.user!.id, status: 'DRAFT' }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or not editable' })

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    }
  })
  res.json(updated)
}

export async function submitRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, createdById: req.user!.id, status: 'DRAFT' }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or already submitted' })
  if (!request.title || !request.description || !request.category) {
    return res.status(400).json({ error: 'Title, description, and category are required before submitting' })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.request.update({
      where: { id: requestId },
      data: { status: 'SUBMITTED', submittedAt: new Date() }
    })
    await tx.statusHistory.create({
      data: { requestId, changedById: req.user!.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED' }
    })
    await tx.auditLog.create({
      data: { action: 'REQUEST_SUBMITTED', requestId, userId: req.user!.id }
    })
    await notifyOrgRole(tx, {
      orgId, role: 'REVIEWER', type: 'REQUEST_SUBMITTED',
      message: `New request submitted: "${request.title}"`,
      requestId
    })
    return r
  })
  res.json(updated)
}

export async function deleteRequest(req: AuthRequest, res: Response) {
  const { requestId, orgId } = req.params

  const request = await prisma.request.findFirst({
    where: { id: requestId, organizationId: orgId, createdById: req.user!.id, status: 'DRAFT' }
  })
  if (!request) return res.status(404).json({ error: 'Request not found or cannot be deleted' })

  await prisma.request.delete({ where: { id: requestId } })
  res.status(204).send()
}