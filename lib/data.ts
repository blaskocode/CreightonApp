import type { Cycle } from "./types"

// Mock data for current cycle
export function getCurrentCycle(): Cycle {
  return {
    id: "current",
    startDate: "2025-05-15",
    endDate: null,
    currentDay: 28,
    days: [
      { dayNumber: 1, date: "2025-05-15", observation: "H X1" },
      { dayNumber: 2, date: "2025-05-16", observation: "H X1" },
      { dayNumber: 3, date: "2025-05-17", observation: "M X1" },
      { dayNumber: 4, date: "2025-05-18", observation: "L X1" },
      { dayNumber: 5, date: "2025-05-19", observation: "VL X1" },
      { dayNumber: 6, date: "2025-05-20", observation: "B 2 X1" },
      { dayNumber: 7, date: "2025-05-21", observation: "0 X1" },
      { dayNumber: 8, date: "2025-05-22", observation: "0 X2" },
      { dayNumber: 9, date: "2025-05-23", observation: "2 X1" },
      { dayNumber: 10, date: "2025-05-24", observation: "2 W X2" },
      { dayNumber: 11, date: "2025-05-25", observation: "4 X3" },
      { dayNumber: 12, date: "2025-05-26", observation: "6P X1" },
      { dayNumber: 13, date: "2025-05-27", observation: "8C X2" },
      { dayNumber: 14, date: "2025-05-28", observation: "10KL X3" },
      { dayNumber: 15, date: "2025-05-29", observation: "10WL AD" },
      { dayNumber: 16, date: "2025-05-30", observation: "10SL X3" },
      { dayNumber: 17, date: "2025-05-31", observation: "8K X2" },
      { dayNumber: 18, date: "2025-06-01", observation: "6G X1" },
      { dayNumber: 19, date: "2025-06-02", observation: "4 X1" },
      { dayNumber: 20, date: "2025-06-03", observation: "2 X2" },
      { dayNumber: 21, date: "2025-06-04", observation: "0 X1" },
      { dayNumber: 22, date: "2025-06-05", observation: "0 X2" },
      { dayNumber: 23, date: "2025-06-06", observation: "0 X3" },
      { dayNumber: 24, date: "2025-06-07", observation: "0 AD" },
      { dayNumber: 25, date: "2025-06-08", observation: "0 X1" },
    ],
  }
}

// Mock data for previous cycle
export function getPreviousCycle(): Cycle {
  return {
    id: "previous",
    startDate: "2025-04-17",
    endDate: "2025-05-14",
    currentDay: 28,
    days: [
      { dayNumber: 1, date: "2025-04-17", observation: "H X1" },
      { dayNumber: 2, date: "2025-04-18", observation: "H X1" },
      { dayNumber: 3, date: "2025-04-19", observation: "M X1" },
      { dayNumber: 4, date: "2025-04-20", observation: "M X1" },
      { dayNumber: 5, date: "2025-04-21", observation: "L X1" },
      { dayNumber: 6, date: "2025-04-22", observation: "VL X1" },
      { dayNumber: 7, date: "2025-04-23", observation: "B 2 X1" },
      { dayNumber: 8, date: "2025-04-24", observation: "0 X1" },
      { dayNumber: 9, date: "2025-04-25", observation: "0 X2" },
      { dayNumber: 10, date: "2025-04-26", observation: "2 X1" },
      { dayNumber: 11, date: "2025-04-27", observation: "2 W X2" },
      { dayNumber: 12, date: "2025-04-28", observation: "4 X3" },
      { dayNumber: 13, date: "2025-04-29", observation: "6C X1" },
      { dayNumber: 14, date: "2025-04-30", observation: "8K X2" },
      { dayNumber: 15, date: "2025-05-01", observation: "10KL X3" },
      { dayNumber: 16, date: "2025-05-02", observation: "10DL AD" },
      { dayNumber: 17, date: "2025-05-03", observation: "8C X2" },
      { dayNumber: 18, date: "2025-05-04", observation: "6G X1" },
      { dayNumber: 19, date: "2025-05-05", observation: "4 X1" },
      { dayNumber: 20, date: "2025-05-06", observation: "2 X2" },
      { dayNumber: 21, date: "2025-05-07", observation: "0 X1" },
      { dayNumber: 22, date: "2025-05-08", observation: "0 X2" },
      { dayNumber: 23, date: "2025-05-09", observation: "0 X3" },
      { dayNumber: 24, date: "2025-05-10", observation: "0 AD" },
      { dayNumber: 25, date: "2025-05-11", observation: "0 X1" },
      { dayNumber: 26, date: "2025-05-12", observation: "0 X2" },
      { dayNumber: 27, date: "2025-05-13", observation: "0 X3" },
      { dayNumber: 28, date: "2025-05-14", observation: "H X1" },
    ],
  }
}

// Add or update an observation for a given day in the current cycle
export function saveObservationToCurrentCycle(dayNumber: number, date: string, observation: string) {
  const current = getCurrentCycle()
  const dayIdx = current.days.findIndex(d => d.dayNumber === dayNumber)
  if (dayIdx !== -1) {
    current.days[dayIdx] = { dayNumber, date, observation }
  } else {
    current.days.push({ dayNumber, date, observation })
    current.days.sort((a, b) => a.dayNumber - b.dayNumber)
  }
}
