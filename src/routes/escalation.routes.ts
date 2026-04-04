import { Router } from 'express'
import { escalateRequest } from '../controllers/escalation.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const escalationRouter = Router({ mergeParams: true })

escalationRouter.post('/escalate', auth, requireOrgMember, requireRole('REVIEWER', 'ADMIN'), escalateRequest)