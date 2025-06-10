import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // Fetch the most recent cycle and its observations
  const cycle = await prisma.cycle.findFirst({
    orderBy: { startDate: 'desc' },
    include: { observations: true },
  })
  return NextResponse.json(cycle)
}

export async function PATCH(req: NextRequest) {
  const { dayNumber, date, observation } = await req.json()
  // Find the most recent cycle
  const cycle = await prisma.cycle.findFirst({ orderBy: { startDate: 'desc' } })
  if (!cycle) {
    return NextResponse.json({ error: 'No cycle found' }, { status: 404 })
  }
  // Try to update existing observation
  const existing = await prisma.observation.findFirst({
    where: { cycleId: cycle.id, dayNumber },
  })
  let result
  if (existing) {
    result = await prisma.observation.update({
      where: { id: existing.id },
      data: { date: new Date(date), observation },
    })
  } else {
    result = await prisma.observation.create({
      data: {
        cycleId: cycle.id,
        dayNumber,
        date: new Date(date),
        observation,
      },
    })
  }
  return NextResponse.json(result)
} 