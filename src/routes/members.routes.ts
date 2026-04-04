import { Router } from 'express'
import { listMembers, addMember, updateMemberRole, removeMember } from '../controllers/members.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const membersRouter = Router({ mergeParams: true })

membersRouter.get('/', auth, requireOrgMember, listMembers)
membersRouter.post('/', auth, requireOrgMember, requireRole('ADMIN'), addMember)
membersRouter.patch('/:userId', auth, requireOrgMember, requireRole('ADMIN'), updateMemberRole)
membersRouter.delete('/:userId', auth, requireOrgMember, requireRole('ADMIN'), removeMember)
