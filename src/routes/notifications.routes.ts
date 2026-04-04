import { Router } from 'express'
import { getNotifications, markOneRead, markAllRead } from '../controllers/notifications.controller'
import { auth } from '../middleware/auth'

export const notificationsRouter = Router()

notificationsRouter.get('/', auth, getNotifications)
notificationsRouter.patch('/read-all', auth, markAllRead)
notificationsRouter.patch('/:notificationId/read', auth, markOneRead)