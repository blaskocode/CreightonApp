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
  const [days, setDays] = useState<CycleDay[]>(cycle.days)

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
      <div className="min-w-[768px]">
        <div className="grid grid-cols-31 gap-1">
          {/* Dates */}
          {Array.from({ length: 31 }, (_, i) => {
            const day = days.find((d) => d.dayNumber === i + 1) || null
            // Format date as MM/DD if available
            let dateStr = ""
            if (day && day.date) {
              const dateObj = new Date(day.date)
              dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
            }
            return (
              <div
                key={`date-${i + 1}`}
                className="text-center text-[10px] text-slate-400 dark:text-slate-500 pb-0.5"
              >
                {dateStr}
              </div>
            )
          })}

          {/* Day numbers */}
          {Array.from({ length: 31 }, (_, i) => (
            <div
              key={`day-${i + 1}`}
              className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1"
            >
              {i + 1}
            </div>
          ))}

          {/* Observations */}
          {Array.from({ length: 31 }, (_, i) => {
            const day = days.find((d) => d.dayNumber === i + 1) || null
            const isCurrentDay = i + 1 === cycle.currentDay && cycle.id === "current"
            // Parse observation and frequency
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
            return (
              <div
                key={`obs-${i + 1}`}
                className={cn(
                  "h-12 flex flex-col items-center justify-center rounded border text-sm font-medium text-center cursor-pointer",
                  getBackgroundColor(day),
                  getTextColor(day),
                  isCurrentDay && "ring-2 ring-blue-500 border-blue-500"
                )}
                onClick={() => day && setEditingDay(day)}
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
              onSave={({ observation, specifier, frequency, secondaryObservation, secondarySpecifier, date }) => {
                let obsString = observation
                if (frequency) {
                  obsString = obsString.trim() + ' ' + frequency
                }
                setDays((prev) => prev.map((d) =>
                  d.dayNumber === editingDay.dayNumber
                    ? { ...d, observation: obsString, date: date.toISOString().split("T")[0] }
                    : d
                ))
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
