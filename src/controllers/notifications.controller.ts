import { Response } from 'express'
import { AuthRequest } from '../types/auth.types'
import { prisma } from '../lib/prisma'

export async function getNotifications(req: AuthRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    include: { request: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' }
  })
  res.json(notifications)
}

export async function markOneRead(req: AuthRequest, res: Response) {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.notificationId, userId: req.user!.id }
  })
  if (!notification) return res.status(404).json({ error: 'Notification not found' })

  const updated = await prisma.notification.update({
    where: { id: req.params.notificationId },
    data: { read: true }
  })
  res.json(updated)
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true }
  })
  res.json({ message: 'All notifications marked as read' })
}