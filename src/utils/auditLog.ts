import { PrismaClient, AuditAction } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export async function createAuditLog(
  tx: TxClient,
  data: {
    action: AuditAction
    userId: string
    requestId?: string
    metadata?: Record<string, unknown>
  }
) {
  return tx.auditLog.create({ data })
}