"use client"
import { cn } from "@/lib/utils"
import type { Cycle, CycleDay } from "@/lib/types"

interface CycleChartProps {
  cycle: Cycle
}

export default function CycleChart({ cycle }: CycleChartProps) {
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
            const day = cycle.days.find((d) => d.dayNumber === i + 1) || null
            return (
              <div
                key={`obs-${i + 1}`}
                className={cn(
                  "h-12 flex items-center justify-center rounded border text-sm font-medium text-center",
                  getBackgroundColor(day),
                  getTextColor(day),
                )}
              >
                <span className="flex items-center justify-center w-full h-full">{day?.observation || ""}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950/30 border"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Red: H, M, L, VL, B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/30 border"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Green: 0, 2, 2W, 4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white dark:bg-slate-800 border"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">White: 6, 8, 10 types</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Cycle day: {cycle.currentDay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
