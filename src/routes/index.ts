import { Router } from 'express'
import { authRouter } from './auth.routes'
import { orgsRouter } from './organizations.routes'
import { membersRouter } from './members.routes'
import { reviewRouter } from './review.routes'
import { requestsRouter } from './requests.routes'
import { escalationRouter } from './escalation.routes'
import { notificationsRouter } from './notifications.routes'
import { dashboardRouter } from './dashboard.routes'

export const router = Router()

router.use('/auth', authRouter)
router.use('/orgs', orgsRouter)
router.use('/orgs/:orgId/members', membersRouter)
router.use('/orgs/:orgId/requests', requestsRouter)
router.use('/orgs/:orgId/requests/:requestId', reviewRouter)
router.use('/orgs/:orgId/requests/:requestId', escalationRouter)
router.use('/notifications', notificationsRouter)
router.use('/orgs/:orgId/dashboard', dashboardRouter)