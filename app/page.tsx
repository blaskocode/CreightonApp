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

export default function Home() {
  const [activeTab, setActiveTab] = useState("chart")
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [previousCycle, setPreviousCycle] = useState<Cycle | null>(null)

  useEffect(() => {
    fetch("/api/cycle")
      .then(res => res.json())
      .then(data => setCycle(data))
    // For mock/demo, use getPreviousCycle from lib/data
    setPreviousCycle(getPreviousCycle())
  }, [])

  if (!cycle || !previousCycle) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Creighton Tracker</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
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
          <Button onClick={() => setActiveTab("entry")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="entry">New Entry</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-4">
              <CycleChart cycle={cycle} />
            </div>
          </TabsContent>

          <TabsContent value="entry">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-6">
              <NewEntryForm />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-6">
              <CycleStats cycle={cycle} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Previous Cycle</h3>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-4">
            <CycleChart cycle={previousCycle} />
          </div>
        </div>
      </main>
    </div>
  )
}
