"use client"

import type { Cycle } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Calendar, Droplets } from "lucide-react"

interface CycleStatsProps {
  cycle: Cycle
}

export default function CycleStats({ cycle }: CycleStatsProps) {
  // Calculate observation type counts
  const getObservationCounts = () => {
    const counts = {
      period: 0,
      dry: 0,
      discharge: 0,
      total: cycle.days.length,
    }

    cycle.days.forEach((day) => {
      if (!day.observation) return

      const obs = day.observation.split(" ")[0]

      if (["H", "M", "L", "VL", "B"].includes(obs)) {
        counts.period++
      } else if (["0", "2", "2 W", "4"].includes(obs)) {
        counts.dry++
      } else if (
        obs.startsWith("6") ||
        obs.startsWith("8") ||
        obs.startsWith("10") ||
        ["10DL", "10SL", "10WL"].includes(obs)
      ) {
        counts.discharge++
      }
    })

    return counts
  }

  const counts = getObservationCounts()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Cycle Statistics</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cycle Length</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cycle.currentDay} days</div>
            <p className="text-xs text-slate-500 mt-1">Current cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Period Days</CardTitle>
            <Droplets className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.period}</div>
            <Progress value={(counts.period / counts.total) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fertile Days</CardTitle>
            <BarChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.discharge}</div>
            <Progress value={(counts.discharge / counts.total) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Observation Breakdown</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Period (H, M, L, VL, B)</span>
              <span className="font-medium">{counts.period} days</span>
            </div>
            <Progress
              value={(counts.period / counts.total) * 100}
              className="h-2 bg-slate-200 dark:bg-slate-700"
              indicatorClassName="bg-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Dry (0, 2, 2W, 4)</span>
              <span className="font-medium">{counts.dry} days</span>
            </div>
            <Progress
              value={(counts.dry / counts.total) * 100}
              className="h-2 bg-slate-200 dark:bg-slate-700"
              indicatorClassName="bg-green-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Discharge (6, 8, 10 types)</span>
              <span className="font-medium">{counts.discharge} days</span>
            </div>
            <Progress
              value={(counts.discharge / counts.total) * 100}
              className="h-2 bg-slate-200 dark:bg-slate-700"
              indicatorClassName="bg-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
