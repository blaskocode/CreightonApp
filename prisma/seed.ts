import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a cycle
  const cycle = await prisma.cycle.create({
    data: {
      startDate: new Date('2025-05-15'),
      endDate: null,
      observations: {
        create: [
          { dayNumber: 1, date: new Date('2025-05-15'), observation: 'H X1' },
          { dayNumber: 2, date: new Date('2025-05-16'), observation: 'H X1' },
          { dayNumber: 3, date: new Date('2025-05-17'), observation: 'M X1' },
          { dayNumber: 4, date: new Date('2025-05-18'), observation: 'L X1' },
          { dayNumber: 5, date: new Date('2025-05-19'), observation: 'VL X1' },
          { dayNumber: 6, date: new Date('2025-05-20'), observation: 'B 2 X1' },
          { dayNumber: 7, date: new Date('2025-05-21'), observation: '0 X1' },
          { dayNumber: 8, date: new Date('2025-05-22'), observation: '0 X2' },
          { dayNumber: 9, date: new Date('2025-05-23'), observation: '2 X1' },
          { dayNumber: 10, date: new Date('2025-05-24'), observation: '2 W X2' },
          { dayNumber: 11, date: new Date('2025-05-25'), observation: '4 X3' },
          { dayNumber: 12, date: new Date('2025-05-26'), observation: '6P X1' },
          { dayNumber: 13, date: new Date('2025-05-27'), observation: '8C X2' },
          { dayNumber: 14, date: new Date('2025-05-28'), observation: '10KL X3' },
          { dayNumber: 15, date: new Date('2025-05-29'), observation: '10WL AD' },
          { dayNumber: 16, date: new Date('2025-05-30'), observation: '10SL X3' },
          { dayNumber: 17, date: new Date('2025-05-31'), observation: '8K X2' },
          { dayNumber: 18, date: new Date('2025-06-01'), observation: '6G X1' },
          { dayNumber: 19, date: new Date('2025-06-02'), observation: '4 X1' },
          { dayNumber: 20, date: new Date('2025-06-03'), observation: '2 X2' },
          { dayNumber: 21, date: new Date('2025-06-04'), observation: '0 X1' },
          { dayNumber: 22, date: new Date('2025-06-05'), observation: '0 X2' },
          { dayNumber: 23, date: new Date('2025-06-06'), observation: '0 X3' },
          { dayNumber: 24, date: new Date('2025-06-07'), observation: '0 AD' },
          { dayNumber: 25, date: new Date('2025-06-08'), observation: '0 X1' },
        ]
      }
    },
    include: { observations: true }
  })
  console.log('Seeded cycle with observations:', cycle)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 