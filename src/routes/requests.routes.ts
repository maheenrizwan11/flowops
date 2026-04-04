import { Router } from 'express'
import {
  createRequest, listRequests, getRequest, updateRequest, submitRequest, deleteRequest
} from '../controllers/requests.controller'
import { auth } from '../middleware/auth'
import { requireOrgMember } from '../middleware/requireOrgMember'
import { requireRole } from '../middleware/requireRole'

export const requestsRouter = Router({ mergeParams: true })

requestsRouter.post('/', auth, requireOrgMember, requireRole('REQUESTER'), createRequest)
requestsRouter.get('/', auth, requireOrgMember, listRequests)
requestsRouter.get('/:requestId', auth, requireOrgMember, getRequest)
requestsRouter.patch('/:requestId', auth, requireOrgMember, requireRole('REQUESTER'), updateRequest)
requestsRouter.post('/:requestId/submit', auth, requireOrgMember, requireRole('REQUESTER'), submitRequest)
requestsRouter.delete('/:requestId', auth, requireOrgMember, requireRole('REQUESTER'), deleteRequest)