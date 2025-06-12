import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // If ?all=1, return all previous cycles
  const url = new URL(req.url);
  if (url.searchParams.get('all') === '1') {
    const previousCycles = await prisma.cycle.findMany({
      where: { NOT: { endDate: null } },
      orderBy: { startDate: 'desc' },
      include: { observations: true },
    });
    return NextResponse.json(previousCycles);
  }
  // Otherwise, fetch the most recent cycle and its observations
  const cycle = await prisma.cycle.findFirst({
    orderBy: { startDate: 'desc' },
    include: { observations: true },
  });
  return NextResponse.json(cycle);
}

export async function PATCH(req: NextRequest) {
  const { dayNumber, date, observation, cycleId } = await req.json()
  // Find the correct cycle
  let cycle;
  if (cycleId) {
    cycle = await prisma.cycle.findUnique({ where: { id: Number(cycleId) } });
  } else {
    cycle = await prisma.cycle.findFirst({ orderBy: { startDate: 'desc' } });
  }
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
      data: { date, observation },
    })
  } else {
    result = await prisma.observation.create({
      data: {
        cycleId: cycle.id,
        dayNumber,
        date,
        observation,
      },
    })
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  // If the request includes an observation, validate it
  let observation = null;
  try {
    const body = await req.json();
    observation = body.observation;
  } catch {}
  if (observation) {
    const filePath = path.join(process.cwd(), 'OnlyValidOptions.txt');
    const file = await fs.readFile(filePath, 'utf-8');
    const validOptions = new Set(file.split('\n').map(line => line.trim()).filter(Boolean));
    if (!validOptions.has(observation)) {
      return NextResponse.json({ error: 'Invalid observation option' }, { status: 400 });
    }
  }
  // Find the most recent cycle
  const current = await prisma.cycle.findFirst({
    orderBy: { startDate: 'desc' },
    include: { observations: true }
  });
  if (!current) return NextResponse.json({ error: 'No current cycle' }, { status: 404 });

  // Find the last filled observation date
  const filled = current.observations.filter(o => o.observation && o.observation.trim() !== '');
  const lastFilled = filled.length > 0 ? filled[filled.length - 1] : null;
  const endDate = lastFilled ? new Date(lastFilled.date) : new Date(current.startDate);

  // Close the current cycle
  await prisma.cycle.update({
    where: { id: current.id },
    data: { endDate }
  });

  // New cycle starts the day after the last day of the previous cycle
  const lastDate = new Date(endDate);
  lastDate.setDate(lastDate.getDate() + 1);
  const newStartDate = lastDate;

  const newCycle = await prisma.cycle.create({
    data: { startDate: newStartDate }
  });

  return NextResponse.json(newCycle);
} 