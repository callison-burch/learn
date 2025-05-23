import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listCourses() {
  const courses = await prisma.course.findMany({
    include: { instructor: true }
  })
  console.log(courses)
}

listCourses().finally(async () => {
  await prisma.$disconnect()
})
