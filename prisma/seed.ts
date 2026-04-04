import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPw = await bcrypt.hash('password123', 12)
  const reviewerPw = await bcrypt.hash('password123', 12)
  const requesterPw = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowops.dev' },
    update: {},
    create: { email: 'admin@flowops.dev', name: 'Admin User', passwordHash: adminPw }
  })
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@flowops.dev' },
    update: {},
    create: { email: 'reviewer@flowops.dev', name: 'Reviewer User', passwordHash: reviewerPw }
  })
  const requester = await prisma.user.upsert({
    where: { email: 'requester@flowops.dev' },
    update: {},
    create: { email: 'requester@flowops.dev', name: 'Requester User', passwordHash: requesterPw }
  })

  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp', slug: 'acme-corp',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: reviewer.id, role: 'REVIEWER' },
          { userId: requester.id, role: 'REQUESTER' }
        ]
      }
    }
  })

  console.log('Seeded org:', org.name)
  console.log('Login credentials: admin@flowops.dev / reviewer@flowops.dev / requester@flowops.dev')
  console.log('All passwords: password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
