import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `backup_${timestamp}.json`

  const data = {
    users: await prisma.user.findMany(),
    posts: await prisma.post.findMany(),
    tags: await prisma.tag.findMany(),
    authorizedPosters: await prisma.authorizedPoster.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
  }

  await fs.writeFile(backupFileName, JSON.stringify(data, null, 2))
  console.log(`Backup created: ${backupFileName}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })