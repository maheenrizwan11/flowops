import { PrismaClient, NotificationType, Role } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export async function createNotification(
  tx: TxClient,
  data: { userId: string; type: NotificationType; message: string; requestId?: string }
) {
  return tx.notification.create({ data })
}

export async function notifyOrgRole(
  tx: TxClient,
  { orgId, role, type, message, requestId }: {
    orgId: string
    role: Role
    type: NotificationType
    message: string
    requestId?: string
  }
) {
  const members = await tx.organizationMember.findMany({
    where: { organizationId: orgId, role }
  })
  await Promise.all(
    members.map(m =>
      tx.notification.create({ data: { userId: m.userId, type, message, requestId } })
    )
  )
}