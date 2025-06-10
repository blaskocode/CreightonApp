"use client"
import { cn } from "@/lib/utils"
import type { Cycle, CycleDay } from "@/lib/types"
import ObservationForm from "./ObservationForm"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CycleChartProps {
  cycle: Cycle
  editable?: boolean
  onObservationSaved?: () => void | Promise<void>
}

// Helper to parse yyyy-mm-dd to Date in UTC
function parseISODateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export default function CycleChart({ cycle, editable, onObservationSaved }: CycleChartProps) {
  const [editingDay, setEditingDay] = useState<CycleDay | null>(null)

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

  // Calculate number of boxes: up to today or 31, whichever is greater
  let numBoxes = 31;
  if (cycle.id === "current" && cycle.startDate) {
    const baseDate = parseISODateToUTC(cycle.startDate);
    const today = new Date(); today.setUTCHours(0,0,0,0);
    const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    numBoxes = Math.max(31, diffDays + 1);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Dates row */}
        <div className="grid grid-cols-31 gap-1 mb-1">
          {Array.from({ length: numBoxes }, (_, i) => {
            let dayDate: Date | null = null;
            let dateStr = "";
            let showDate = false;
            if (cycle.id === "current" && cycle.startDate) {
              const baseDate = parseISODateToUTC(cycle.startDate);
              dayDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
              const today = new Date(); today.setUTCHours(0,0,0,0);
              if (dayDate.getTime() <= today.getTime()) {
                dateStr = `${dayDate.getUTCMonth() + 1}/${dayDate.getUTCDate()}`;
                showDate = true;
              }
            } else {
              const day = cycle.days.find((d) => d.dayNumber === i + 1) || null;
              if (day && day.date) {
                dayDate = parseISODateToUTC(day.date);
                dateStr = `${dayDate.getUTCMonth() + 1}/${dayDate.getUTCDate()}`;
                showDate = true;
              }
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
          {Array.from({ length: numBoxes }, (_, i) => (
            <div key={`daynum-${i + 1}`} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
              {i + 1}
            </div>
          ))}
        </div>
        {/* Observation boxes row */}
        <div className="grid grid-cols-31 gap-1">
          {Array.from({ length: numBoxes }, (_, i) => {
            // isEditable must be declared before use
            let isEditable = false;
            let boxDate: Date | null = null;
            let day: CycleDay | null = null;
            if (cycle.id === "current" && cycle.startDate) {
              const baseDate = parseISODateToUTC(cycle.startDate);
              boxDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
              const dateStr = boxDate.toISOString().split("T")[0];
              day = cycle.days.find((d) => d.date === dateStr) || null;
            } else {
              day = cycle.days.find((d) => d.dayNumber === i + 1) || null;
              if (day && day.date) {
                boxDate = parseISODateToUTC(day.date);
              }
            }
            const today = new Date()
            today.setUTCHours(0,0,0,0)
            if (boxDate) boxDate.setUTCHours(0,0,0,0)

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
            if (cycle.id === "current" && boxDate) {
              if (boxDate.getTime() <= today.getTime()) {
                isEditable = true;
              }
            } else if (cycle.id !== "current" && editable) {
              isEditable = true;
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
                  "bg-red-100 border-red-400 ring-2 ring-red-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                );
              } else if (isCurrentDay) {
                // Today: always show blue ring, even if there is an observation
                boxClass = cn(
                  boxClass,
                  day && day.observation ? getBackgroundColor(day) : "bg-white dark:bg-slate-800",
                  day && day.observation ? getTextColor(day) : "",
                  "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 border-blue-500"
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
              } else if (day) {
                boxClass = cn(
                  boxClass,
                  getBackgroundColor(day),
                  getTextColor(day)
                );
              }
              // Add hover effect for editable boxes
              if (isEditable) {
                boxClass = cn(boxClass, "hover:ring-2 hover:ring-blue-200 focus:outline-none");
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
              // Add hover effect for editable previous cycles
              if (isEditable) {
                boxClass = cn(boxClass, "hover:ring-2 hover:ring-blue-200 focus:outline-none");
              }
            }
            if (isFutureDay) {
              mainObs = ""
              freq = ""
            }
            return (
              <div
                key={`box-${i + 1}`}
                className={cn(
                  "relative aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors",
                  isEditable && "cursor-pointer tap-feedback",
                  isCurrentDay && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                  isPastDay && "border-slate-200 dark:border-slate-800",
                  isFutureDay && "border-slate-100 dark:border-slate-900",
                  isEditable && "hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  !isEditable && "opacity-50"
                )}
                onClick={() => {
                  if (isEditable) {
                    setEditingDay(day || { dayNumber: i + 1, date: boxDate?.toISOString().split("T")[0] || "", observation: null });
                  }
                }}
                onTouchStart={(e) => {
                  if (isEditable) {
                    e.currentTarget.classList.add('active');
                  }
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.classList.remove('active');
                }}
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
            <span className="text-xs text-slate-600 dark:text-slate-400">Cycle day: {(() => {
              if (cycle.id === "current" && cycle.startDate) {
                return cycle.currentDay;
              }
              return cycle.currentDay;
            })()}</span>
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
                    date: editingDay.date, // keep original date for previous cycles
                    observation: obsString
                  })
                })
                if (typeof onObservationSaved === 'function') {
                  await onObservationSaved();
                }
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
