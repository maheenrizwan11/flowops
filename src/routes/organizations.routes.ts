import { Router } from 'express'
import { createOrg, listMyOrgs, getOrg, updateOrg, deleteOrg } from '../controllers/organizations.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const orgsRouter = Router()

orgsRouter.post('/', auth, createOrg)
orgsRouter.get('/', auth, listMyOrgs)
orgsRouter.get('/:orgId', auth, requireOrgMember, getOrg)
orgsRouter.patch('/:orgId', auth, requireOrgMember, requireRole('ADMIN'), updateOrg)
orgsRouter.delete('/:orgId', auth, requireOrgMember, requireRole('ADMIN'), deleteOrg)
