export interface CycleDay {
  dayNumber: number
  date: string
  observation: string | null
}

export interface Cycle {
  id: string
  startDate: string
  endDate: string | null
  currentDay: number
  days: CycleDay[]
}
