import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['REVIEWER', 'REQUESTER'])
})

export async function listMembers(req: Request, res: Response) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: req.params.orgId },
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  res.json(members)
}

export async function addMember(req: Request, res: Response) {
  const parsed = addMemberSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, role } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'User not found. They must register first.' })

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: req.params.orgId, userId: user.id } }
  })
  if (existing) return res.status(409).json({ error: 'User is already a member' })

  const member = await prisma.organizationMember.create({
    data: { organizationId: req.params.orgId, userId: user.id, role }
  })
  res.status(201).json(member)
}

export async function updateMemberRole(req: Request, res: Response) {
  const member = await prisma.organizationMember.update({
    where: { organizationId_userId: { organizationId: req.params.orgId, userId: req.params.userId } },
    data: { role: req.body.role }
  })
  res.json(member)
}

export async function removeMember(req: Request, res: Response) {
  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId: req.params.orgId, userId: req.params.userId } }
  })
  res.status(204).send()
}
