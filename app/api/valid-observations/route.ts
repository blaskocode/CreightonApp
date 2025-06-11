import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'OnlyValidOptions.txt');
  const file = await fs.readFile(filePath, 'utf-8');
  const lines = file.split('\n').map(line => line.trim()).filter(Boolean);
  return NextResponse.json(lines);
} 