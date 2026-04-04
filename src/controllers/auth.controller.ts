import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, comparePassword } from '../utils/hash'
import { signToken } from '../utils/jwt'
import { z } from 'zod'
import { AuthRequest } from '../types/auth.types'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password, name } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })
  const token = signToken({ id: user.id, email: user.email, name: user.name })
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ id: user.id, email: user.email, name: user.name })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
}

// export async function getMe(req: Request, res: Response) {
//   const user = await prisma.user.findUnique({
//     where: { id: req.user!.id },
//     select: { id: true, email: true, name: true, createdAt: true, memberships: {
//       include: { organization: { select: { id: true, name: true, slug: true } } }
//     }}
//   })
//   res.json(user)
// }
export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, createdAt: true, memberships: {
      include: { organization: { select: { id: true, name: true, slug: true } } }
    }}
  })
  res.json(user)
}
