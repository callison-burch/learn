import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@example.com',
      name: 'Instructor',
      role: 'instructor',
    },
  })

  const course = await prisma.course.create({
    data: {
      name: 'Intro to AI',
      description: 'Basics of artificial intelligence',
      instructorId: instructor.id,
    },
  })

  await prisma.question.create({
    data: {
      courseId: course.id,
      content: 'What is AI?',
      type: 'short_answer',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
