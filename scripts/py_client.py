from prisma import Prisma
import asyncio

async def main() -> None:
    db = Prisma()
    await db.connect()

    courses = await db.course.find_many(include={"instructor": True})
    print(courses)

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
