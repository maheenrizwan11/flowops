import { Router } from 'express'
import { startReview, approveRequest, rejectRequest, getAuditTrail } from '../controllers/review.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const reviewRouter = Router({ mergeParams: true })

reviewRouter.post('/review/start', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), startReview)
reviewRouter.post('/review/approve', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), approveRequest)
reviewRouter.post('/review/reject', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), rejectRequest)
reviewRouter.get('/audit', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), getAuditTrail)
