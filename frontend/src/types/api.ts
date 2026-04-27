export type Role = 'ADMIN' | 'REVIEWER' | 'REQUESTER'

export type RequestStatus =
  | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW'
  | 'ESCALATED' | 'APPROVED' | 'REJECTED' | 'CLOSED'

export type NotificationType =
  | 'REQUEST_SUBMITTED' | 'STATUS_UPDATED'
  | 'REQUEST_ASSIGNED' | 'REQUEST_ESCALATED'

export type AuditAction =
  | 'REQUEST_CREATED' | 'REQUEST_SUBMITTED' | 'REVIEW_STARTED'
  | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'REQUEST_ESCALATED'
  | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'ROLE_CHANGED'

export interface User { id: string; email: string; name: string; createdAt?: string }

export interface Organization { id: string; name: string; slug: string }

export interface Membership {
  id: string
  role: Role
  organization: Organization
}

export interface Me extends User { memberships: Membership[] }

export interface RequestItem {
  id: string
  title: string
  description: string
  category: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  closedAt: string | null
  organizationId: string
  createdById: string
  assignedToId: string | null
  createdBy?: { id: string; name: string; email: string }
  assignedTo?: { id: string; name: string; email: string } | null
}

export interface StatusHistoryItem {
  id: string
  fromStatus: RequestStatus | null
  toStatus: RequestStatus
  note: string | null
  changedAt: string
  changedBy: { id: string; name: string }
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
  requestId: string | null
}

export interface MemberRow {
  id: string
  role: Role
  joinedAt: string
  user: { id: string; name: string; email: string }
}

export interface AuditLogItem {
  id: string
  action: AuditAction
  metadata: any
  createdAt: string
  user: { id: string; name: string }
}