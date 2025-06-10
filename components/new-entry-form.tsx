"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function NewEntryForm({ onEntrySaved }: { onEntrySaved?: () => void | Promise<void> }) {
  const [primaryObservation, setPrimaryObservation] = useState("")
  const [specifier, setSpecifier] = useState("")
  const [frequency, setFrequency] = useState("")
  const [secondaryObservation, setSecondaryObservation] = useState("")
  const [secondarySpecifier, setSecondarySpecifier] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const needsSpecifier = ["6", "8", "10"].includes(primaryObservation)
  const needsSecondary = ["L", "VL", "B"].includes(primaryObservation)

  const getBackgroundColor = () => {
    if (["H", "M", "L", "VL", "B"].includes(primaryObservation)) {
      return "bg-red-50 dark:bg-red-950/20"
    } else if (["0", "2", "2 W", "4"].includes(primaryObservation)) {
      return "bg-green-50 dark:bg-green-950/20"
    } else if (
      primaryObservation.startsWith("6") ||
      primaryObservation.startsWith("8") ||
      primaryObservation.startsWith("10") ||
      ["10DL", "10SL", "10WL"].includes(primaryObservation)
    ) {
      return "bg-white dark:bg-slate-800"
    }

    return ""
  }

  const getFormattedEntry = () => {
    let entry = primaryObservation

    if (needsSpecifier && specifier) {
      entry += specifier
    }

    if (needsSecondary && secondaryObservation) {
      entry += ` ${secondaryObservation}`

      if (["6", "8", "10"].includes(secondaryObservation) && secondarySpecifier) {
        entry += secondarySpecifier
      }
    }

    if (frequency) {
      entry += ` ${frequency}`
    }

    return entry
  }

  const handleSaveEntry = async () => {
    const entry = getFormattedEntry()
    const date = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    // Save to API
    await fetch('/api/cycle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dayNumber: undefined, // You may want to calculate this based on date
        date,
        observation: entry
      })
    })
    if (onEntrySaved) await onEntrySaved();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">New Observation Entry</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Select Date
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Date</DialogTitle>
            </DialogHeader>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-base">Primary Observation</Label>
            <Tabs defaultValue="period" className="mt-2">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="period">Period</TabsTrigger>
                <TabsTrigger value="dry">Dry</TabsTrigger>
                <TabsTrigger value="discharge">Discharge</TabsTrigger>
              </TabsList>

              <TabsContent value="period" className="mt-4">
                <RadioGroup
                  className="grid grid-cols-2 gap-2"
                  onValueChange={setPrimaryObservation}
                  value={primaryObservation}
                >
                  {["H", "M", "L", "VL", "B"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`period-${value}`} />
                      <Label htmlFor={`period-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>

              <TabsContent value="dry" className="mt-4">
                <RadioGroup
                  className="grid grid-cols-2 gap-2"
                  onValueChange={setPrimaryObservation}
                  value={primaryObservation}
                >
                  {["0", "2", "2 W", "4"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`dry-${value}`} />
                      <Label htmlFor={`dry-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>

              <TabsContent value="discharge" className="mt-4 space-y-4">
                <RadioGroup
                  className="grid grid-cols-2 gap-2"
                  onValueChange={setPrimaryObservation}
                  value={primaryObservation}
                >
                  {["6", "8", "10", "10DL", "10SL", "10WL"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`discharge-${value}`} />
                      <Label htmlFor={`discharge-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {needsSpecifier && (
                  <div className="mt-4">
                    <Label>Specifier</Label>
                    <RadioGroup className="grid grid-cols-5 gap-2 mt-2" onValueChange={setSpecifier} value={specifier}>
                      {["B", "C", "C/K", "G", "K", "KL", "L", "P", "R", "Y"].map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`specifier-${value}`} />
                          <Label htmlFor={`specifier-${value}`}>{value}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {needsSecondary && (
            <div className="mt-6">
              <Label className="text-base">Secondary Observation</Label>
              <RadioGroup
                className="grid grid-cols-3 gap-2 mt-2"
                onValueChange={setSecondaryObservation}
                value={secondaryObservation}
              >
                {["0", "2", "2 W", "4", "6", "8", "10"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`secondary-${value}`} />
                    <Label htmlFor={`secondary-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>

              {["6", "8", "10"].includes(secondaryObservation) && (
                <div className="mt-4">
                  <Label>Secondary Specifier</Label>
                  <RadioGroup
                    className="grid grid-cols-5 gap-2 mt-2"
                    onValueChange={setSecondarySpecifier}
                    value={secondarySpecifier}
                  >
                    {["B", "C", "C/K", "G", "K", "KL", "L", "P", "R", "Y"].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`secondary-specifier-${value}`} />
                        <Label htmlFor={`secondary-specifier-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {needsSecondary && (
            <div className="mt-6">
              <Label className="text-base">Frequency</Label>
              <RadioGroup className="grid grid-cols-4 gap-2 mt-2" onValueChange={setFrequency} value={frequency}>
                {["X1", "X2", "X3", "AD"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`frequency-${value}`} />
                    <Label htmlFor={`frequency-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent
              className={cn("p-6 flex items-center justify-center h-40 text-xl font-medium", getBackgroundColor())}
            >
              {getFormattedEntry() || "Select observation"}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" disabled={!primaryObservation} onClick={handleSaveEntry}>
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  )
}
