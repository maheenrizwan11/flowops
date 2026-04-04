import { Router } from 'express'
import { requesterDashboard, reviewerDashboard, adminDashboard } from '../controllers/dashboard.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const dashboardRouter = Router({ mergeParams: true })

dashboardRouter.get('/requester', auth, requireOrgMember, requireRole('REQUESTER'), requesterDashboard)
dashboardRouter.get('/reviewer', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), reviewerDashboard)
dashboardRouter.get('/admin', auth, requireOrgMember, requireRole('ADMIN'), adminDashboard)