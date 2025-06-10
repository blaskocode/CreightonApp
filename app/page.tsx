"use client"

import { useState, useEffect } from "react"
import type { Cycle } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import CycleChart from "@/components/cycle-chart"
import NewEntryForm from "@/components/new-entry-form"
import CycleStats from "@/components/cycle-stats"
import { getCurrentCycle, getPreviousCycle } from "@/lib/data"
import { addDays, format } from "date-fns"

export default function Home() {
  const [activeTab, setActiveTab] = useState("chart")
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [previousCycles, setPreviousCycles] = useState<Cycle[]>([])
  const [prevCycleIndex, setPrevCycleIndex] = useState(0)
  const [editPrev, setEditPrev] = useState(false)

  useEffect(() => {
    fetch("/api/cycle")
      .then(res => res.json())
      .then(data => {
        // Helper to format date string to yyyy-mm-dd
        function toYMD(date: string) {
          return date ? date.split('T')[0] : '';
        }
        // Always map the most recent cycle to id: 'current'
        if (data && Array.isArray(data.observations)) {
          setCycle({
            id: 'current',
            startDate: toYMD(data.startDate),
            endDate: data.endDate ? toYMD(data.endDate) : null,
            currentDay: data.observations.length,
            days: data.observations.map((o: any) => ({
              dayNumber: o.dayNumber,
              date: toYMD(o.date),
              observation: o.observation ?? null
            }))
          });
        } else if (data) {
          // If data is a single cycle object, still map to id: 'current'
          setCycle({
            id: 'current',
            startDate: toYMD(data.startDate),
            endDate: data.endDate ? toYMD(data.endDate) : null,
            currentDay: Array.isArray(data.observations) ? data.observations.length : 0,
            days: Array.isArray(data.observations)
              ? data.observations.map((o: any) => ({
                  dayNumber: o.dayNumber,
                  date: toYMD(o.date),
                  observation: o.observation ?? null
                }))
              : []
          });
        } else {
          setCycle(null);
        }
      })
    // Fetch previous cycles from backend
    fetch("/api/cycle?all=1")
      .then(res => res.json())
      .then(data => {
        function toYMD(date: string) {
          return date ? date.split('T')[0] : '';
        }
        setPreviousCycles(
          Array.isArray(data)
            ? data.map((cycle: any) => ({
                id: String(cycle.id),
                startDate: toYMD(cycle.startDate),
                endDate: cycle.endDate ? toYMD(cycle.endDate) : null,
                currentDay: Array.isArray(cycle.observations) ? cycle.observations.length : 0,
                days: Array.isArray(cycle.observations)
                  ? cycle.observations.map((o: any) => ({
                      dayNumber: o.dayNumber,
                      date: toYMD(o.date),
                      observation: o.observation ?? null
                    }))
                  : []
              }))
            : []
        );
      });
  }, [])

  if (!cycle) return <div className="p-8 text-center">Loading...</div>

  function createBlankCycle(): Cycle {
    const today = new Date()
    const startDate = format(today, 'yyyy-MM-dd')
    return {
      id: `current-${Date.now()}`,
      startDate,
      endDate: null,
      currentDay: 1,
      days: [
        { dayNumber: 1, date: startDate, observation: null }
      ]
    }
  }

  async function handleNewCycle() {
    // Call the backend to close the current cycle and create a new one
    await fetch('/api/cycle', { method: 'POST' });
    // Refresh the cycles from the backend
    await refreshCycle();
    setPrevCycleIndex(0);
  }

  // Add a function to refresh the current cycle from the API
  async function refreshCycle() {
    const res = await fetch("/api/cycle");
    const data = await res.json();
    function toYMD(date: string) {
      return date ? date.split('T')[0] : '';
    }
    if (data && Array.isArray(data.observations)) {
      setCycle({
        id: 'current',
        startDate: toYMD(data.startDate),
        endDate: data.endDate ? toYMD(data.endDate) : null,
        currentDay: data.observations.length,
        days: data.observations.map((o: any) => ({
          dayNumber: o.dayNumber,
          date: toYMD(o.date),
          observation: o.observation ?? null
        }))
      });
    } else if (data) {
      setCycle({
        id: 'current',
        startDate: toYMD(data.startDate),
        endDate: data.endDate ? toYMD(data.endDate) : null,
        currentDay: Array.isArray(data.observations) ? data.observations.length : 0,
        days: Array.isArray(data.observations)
          ? data.observations.map((o: any) => ({
              dayNumber: o.dayNumber,
              date: toYMD(o.date),
              observation: o.observation ?? null
            }))
          : []
      });
    } else {
      setCycle(null);
    }
    // Also refresh previous cycles
    const prevRes = await fetch("/api/cycle?all=1");
    const prevData = await prevRes.json();
    setPreviousCycles(
      Array.isArray(prevData)
        ? prevData.map((cycle: any) => ({
            id: String(cycle.id),
            startDate: toYMD(cycle.startDate),
            endDate: cycle.endDate ? toYMD(cycle.endDate) : null,
            currentDay: Array.isArray(cycle.observations) ? cycle.observations.length : 0,
            days: Array.isArray(cycle.observations)
              ? cycle.observations.map((o: any) => ({
                  dayNumber: o.dayNumber,
                  date: toYMD(o.date),
                  observation: o.observation ?? null
                }))
              : []
          }))
        : []
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Creighton Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">Current Cycle</h2>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleNewCycle}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Cycle
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-4 mb-6">
          <CycleChart cycle={cycle} onObservationSaved={refreshCycle} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-6">
          <CycleStats cycle={cycle} />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Previous Cycles</h3>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" onClick={() => setPrevCycleIndex(i => Math.max(0, i - 1))} disabled={prevCycleIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPrevCycleIndex(i => Math.min(previousCycles.length - 1, i + 1))} disabled={prevCycleIndex === previousCycles.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant={editPrev ? "default" : "outline"} size="sm" className="ml-4" onClick={() => setEditPrev(e => !e)}>
                {editPrev ? "Done" : "Edit"}
              </Button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-4">
            {previousCycles.length > 0 && <CycleChart cycle={previousCycles[prevCycleIndex]} editable={editPrev} />}
            {previousCycles.length === 0 && <div className="text-center text-slate-400">No previous cycles</div>}
          </div>
        </div>

        <NewEntryForm onEntrySaved={refreshCycle} />
      </main>
    </div>
  )
}
