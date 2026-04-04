import { Router } from 'express'
import { authRouter } from './auth.routes'
import { orgsRouter } from './organizations.routes'
import { membersRouter } from './members.routes'
import { reviewRouter } from './review.routes'
// Juweriya will add: requestsRouter, escalationRouter, notificationsRouter, dashboardRouter

export const router = Router()

router.use('/auth', authRouter)
router.use('/orgs', orgsRouter)
router.use('/orgs/:orgId/members', membersRouter)
router.use('/orgs/:orgId/requests/:requestId', reviewRouter)
