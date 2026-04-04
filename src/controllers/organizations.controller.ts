import { Response } from 'express'
import { AuthRequest } from '../types/auth.types'  // import this
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/)
})

export async function createOrg(req: AuthRequest, res: Response) {
  const parsed = createOrgSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, slug } = parsed.data
  const existing = await prisma.organization.findUnique({ where: { slug } })
  if (existing) return res.status(409).json({ error: 'Slug already taken' })

  const org = await prisma.organization.create({
    data: {
      name, slug,
      members: { create: { userId: req.user!.id, role: 'ADMIN' } }
    },
    include: { members: true }
  })
  res.status(201).json(org)
}

export async function listMyOrgs(req: AuthRequest, res: Response) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: req.user!.id },
    include: { organization: true }
  })
  res.json(memberships.map(m => ({ ...m.organization, role: m.role })))
}

export async function getOrg(req: AuthRequest, res: Response) {
  const org = await prisma.organization.findUnique({
    where: { id: req.params.orgId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
  })
  if (!org) return res.status(404).json({ error: 'Organization not found' })
  res.json(org)
}

export async function updateOrg(req: AuthRequest, res: Response) {
  const org = await prisma.organization.update({
    where: { id: req.params.orgId },
    data: { name: req.body.name }
  })
  res.json(org)
}

export async function deleteOrg(req: AuthRequest, res: Response) {
  await prisma.organization.delete({ where: { id: req.params.orgId } })
  res.status(204).send()
}
