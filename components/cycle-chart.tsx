"use client"
import { cn } from "@/lib/utils"
import type { Cycle, CycleDay } from "@/lib/types"
import ObservationForm from "./ObservationForm"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CycleChartProps {
  cycle: Cycle
}

export default function CycleChart({ cycle }: CycleChartProps) {
  const [editingDay, setEditingDay] = useState<CycleDay | null>(null)
  // Always use observations if present, else days, else empty array
  const initialDays = Array.isArray((cycle as any).observations)
    ? (cycle as any).observations.map((o: any) => ({
        dayNumber: o.dayNumber,
        date: o.date,
        observation: o.observation,
      }))
    : Array.isArray(cycle.days)
      ? cycle.days
      : []
  const [days, setDays] = useState<CycleDay[]>(initialDays)

  // Function to determine background color based on observation
  const getBackgroundColor = (day: CycleDay | null) => {
    if (!day || !day.observation) return "bg-red-100 dark:bg-red-950/30"

    const obs = day.observation.split(" ")[0]

    if (["H", "M", "L", "VL", "B"].includes(obs)) {
      return "bg-red-100 dark:bg-red-950/30"
    } else if (["0", "2", "2 W", "4"].includes(obs)) {
      return "bg-green-100 dark:bg-green-950/30"
    } else if (
      obs.startsWith("6") ||
      obs.startsWith("8") ||
      obs.startsWith("10") ||
      ["10DL", "10SL", "10WL"].includes(obs)
    ) {
      return "bg-white dark:bg-slate-800"
    }

    return "bg-white dark:bg-slate-800"
  }

  // Function to get text color based on background
  const getTextColor = (day: CycleDay | null) => {
    if (!day || !day.observation) return "text-red-700 dark:text-red-400"

    const obs = day.observation.split(" ")[0]

    if (["H", "M", "L", "VL", "B"].includes(obs)) {
      return "text-red-700 dark:text-red-400"
    } else if (["0", "2", "2 W", "4"].includes(obs)) {
      return "text-green-700 dark:text-green-400"
    } else {
      return "text-slate-700 dark:text-slate-300"
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Dates row */}
        <div className="grid grid-cols-31 gap-1 mb-1">
          {Array.from({ length: 31 }, (_, i) => {
            const day = days.find((d) => d.dayNumber === i + 1) || null
            let dateStr = ""
            let dayDate: Date | null = null
            if (day && day.date) {
              dayDate = new Date(day.date)
              dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`
            } else if (cycle.id === "current" && cycle.days.length > 0) {
              const firstDay = cycle.days[0]
              if (firstDay && firstDay.date) {
                const baseDate = new Date(firstDay.date)
                dayDate = new Date(baseDate)
                dayDate.setDate(baseDate.getDate() + i)
                dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`
              }
            }
            // Only show date for today and past days in current cycle
            let showDate = false
            if (cycle.id === "current" && dayDate) {
              const today = new Date(); today.setHours(0,0,0,0);
              if (dayDate.getTime() <= today.getTime()) showDate = true;
            } else if (cycle.id !== "current") {
              showDate = true;
            }
            return (
              <div
                key={`date-${i + 1}`}
                className="text-center text-[10px] text-slate-400 dark:text-slate-500 pb-0.5"
              >
                {showDate ? dateStr : ""}
              </div>
            )
          })}
        </div>
        {/* Day numbers row */}
        <div className="grid grid-cols-31 gap-1 mb-1">
          {Array.from({ length: 31 }, (_, i) => (
            <div key={`daynum-${i + 1}`} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
              {i + 1}
            </div>
          ))}
        </div>
        {/* Observation boxes row */}
        <div className="grid grid-cols-31 gap-1">
          {Array.from({ length: 31 }, (_, i) => {
            const day = days.find((d) => d.dayNumber === i + 1) || null
            let boxDate: Date | null = null
            if (day && day.date) {
              boxDate = new Date(day.date)
            } else if (cycle.id === "current" && days.length > 0) {
              const firstDay = days[0]
              if (firstDay && firstDay.date) {
                const baseDate = new Date(firstDay.date)
                boxDate = new Date(baseDate)
                boxDate.setDate(baseDate.getDate() + i)
              }
            }
            const today = new Date()
            today.setHours(0,0,0,0)
            if (boxDate) boxDate.setHours(0,0,0,0)

            let isCurrentDay = false
            let isPastDay = false
            let isFutureDay = false
            if (cycle.id === "current" && boxDate) {
              if (boxDate.getTime() === today.getTime()) {
                isCurrentDay = true
              } else if (boxDate.getTime() < today.getTime()) {
                isPastDay = true
              } else if (boxDate.getTime() > today.getTime()) {
                isFutureDay = true
              }
            }
            let mainObs = ""
            let freq = ""
            if (day?.observation) {
              const parts = day.observation.trim().split(" ")
              const freqCandidates = ["X1", "X2", "X3", "AD"]
              if (parts.length > 1 && freqCandidates.includes(parts[parts.length - 1])) {
                freq = parts.pop() || ""
                mainObs = parts.join(" ")
              } else {
                mainObs = day.observation
              }
            }
            // Custom box class logic for current cycle
            let boxClass = "h-12 flex flex-col items-center justify-center rounded border text-sm font-medium text-center cursor-pointer transition-colors duration-100";
            if (cycle.id === "current") {
              if (isPastDay && !day?.observation) {
                // Past day, no observation: red fill, red ring, empty
                boxClass = cn(
                  boxClass,
                  "bg-red-100 border-red-400 ring-2 ring-red-400 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                );
              } else if (isCurrentDay && !day?.observation) {
                // Today, no observation: blue ring, no fill
                boxClass = cn(
                  boxClass,
                  "border-blue-500 ring-2 ring-blue-500 bg-white dark:bg-slate-800"
                );
              } else if (day && day.observation) {
                boxClass = cn(
                  boxClass,
                  getBackgroundColor(day),
                  getTextColor(day)
                );
              } else if (!day && isFutureDay) {
                boxClass = cn(
                  boxClass,
                  "bg-white dark:bg-slate-800 text-slate-300 border-slate-200 dark:border-slate-700 cursor-default"
                );
              } else if (isCurrentDay) {
                boxClass = cn(
                  boxClass,
                  getBackgroundColor(day),
                  getTextColor(day),
                  "ring-2 ring-blue-500 border-blue-500"
                );
              } else if (day) {
                boxClass = cn(
                  boxClass,
                  getBackgroundColor(day),
                  getTextColor(day)
                );
              }
            } else {
              // Not current cycle: use default logic
              if (day && day.observation) {
                boxClass = cn(
                  boxClass,
                  getBackgroundColor(day),
                  getTextColor(day)
                );
              } else {
                boxClass = cn(
                  boxClass,
                  "bg-white text-slate-300 border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-default"
                );
              }
            }
            if (isFutureDay) {
              mainObs = ""
              freq = ""
            }
            return (
              <div
                key={`obs-${i + 1}`}
                className={boxClass}
                onClick={() => (day ? setEditingDay(day) : (boxDate && (isPastDay || isCurrentDay) && setEditingDay({ dayNumber: i + 1, date: boxDate.toISOString().split("T")[0], observation: null })))}
                style={{ pointerEvents: day ? 'auto' : 'none' }}
              >
                <span className="flex flex-col items-center justify-center w-full h-full">
                  <span>{mainObs}</span>
                  {freq && <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{freq}</span>}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Cycle day: {cycle.currentDay}</span>
          </div>
        </div>
      </div>
      {/* Modal for editing observation */}
      {editingDay && (
        <Dialog open={!!editingDay} onOpenChange={(open) => !open && setEditingDay(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Observation</DialogTitle>
            </DialogHeader>
            <ObservationForm
              {...(() => {
                let initialObservation = ""
                let initialFrequency = ""
                let initialTab = "period"
                if (editingDay.observation) {
                  const parts = editingDay.observation.trim().split(" ")
                  const freqCandidates = ["X1", "X2", "X3", "AD"]
                  if (parts.length > 1 && freqCandidates.includes(parts[parts.length - 1])) {
                    initialFrequency = parts.pop() || ""
                  }
                  initialObservation = parts.join(" ")
                  // Determine tab
                  if (["0", "2", "2 W", "4"].includes(initialObservation)) {
                    initialTab = "dry"
                  } else if (["6", "8", "10", "10DL", "10SL", "10WL"].some(type => initialObservation.startsWith(type))) {
                    initialTab = "discharge"
                  } else {
                    initialTab = "period"
                  }
                }
                return {
                  initialObservation,
                  initialSpecifier: "",
                  initialFrequency,
                  initialSecondaryObservation: "",
                  initialSecondarySpecifier: "",
                  initialDate: new Date(editingDay.date),
                  initialTab,
                }
              })()}
              onSave={async ({ observation, specifier, frequency, secondaryObservation, secondarySpecifier, date }) => {
                let obsString = observation
                if (frequency) {
                  obsString = obsString.trim() + ' ' + frequency
                }
                // Save to database via API
                await fetch('/api/cycle', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    dayNumber: editingDay.dayNumber,
                    date: date.toISOString().split("T")[0],
                    observation: obsString
                  })
                })
                // Refresh the days from API
                const res = await fetch('/api/cycle')
                const updatedCycle = await res.json()
                setDays((updatedCycle.observations as Array<{ dayNumber: number; date: string; observation: string | null }> ).map((o) => ({
                  dayNumber: o.dayNumber,
                  date: o.date,
                  observation: o.observation
                })))
                setEditingDay(null)
              }}
              onCancel={() => setEditingDay(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
