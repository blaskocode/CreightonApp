"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface ObservationFormProps {
  initialObservation?: string
  initialSpecifier?: string
  initialFrequency?: string
  initialSecondaryObservation?: string
  initialSecondarySpecifier?: string
  initialDate?: Date
  initialTab?: string
  onSave: (data: {
    observation: string
    specifier: string
    frequency: string
    secondaryObservation: string
    secondarySpecifier: string
    date: Date
  }) => void
  onCancel?: () => void
}

export default function ObservationForm({
  initialObservation = "",
  initialSpecifier = "",
  initialFrequency = "",
  initialSecondaryObservation = "",
  initialSecondarySpecifier = "",
  initialDate = new Date(),
  initialTab = "period",
  onSave,
  onCancel,
}: ObservationFormProps) {
  const [primaryObservation, setPrimaryObservation] = useState(initialObservation)
  const [specifier, setSpecifier] = useState(initialSpecifier)
  const [frequency, setFrequency] = useState(initialFrequency)
  const [secondaryObservation, setSecondaryObservation] = useState(initialSecondaryObservation)
  const [secondarySpecifier, setSecondarySpecifier] = useState(initialSecondarySpecifier)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setPrimaryObservation(initialObservation)
    setSpecifier(initialSpecifier)
    setFrequency(initialFrequency)
    setSecondaryObservation(initialSecondaryObservation)
    setSecondarySpecifier(initialSecondarySpecifier)
    setSelectedDate(initialDate)
    setActiveTab(initialTab)
  }, [initialObservation, initialSpecifier, initialFrequency, initialSecondaryObservation, initialSecondarySpecifier, initialDate, initialTab])

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

  const dryTypes = ["0", "2", "2 W", "4"]
  const dischargeTypes = ["6", "8", "10", "10DL", "10SL", "10WL"]
  const frequencyRequired =
    dryTypes.includes(primaryObservation) ||
    dischargeTypes.includes(primaryObservation) ||
    dryTypes.includes(secondaryObservation) ||
    dischargeTypes.includes(secondaryObservation)

  const handleSave = () => {
    setError("")
    if (!selectedDate) return
    if (frequencyRequired && !frequency) {
      setError("Frequency is required for all Dry and Discharge observations.")
      return
    }
    onSave({
      observation: primaryObservation,
      specifier,
      frequency,
      secondaryObservation,
      secondarySpecifier,
      date: selectedDate,
    })
  }

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-8 md:items-start min-w-0">
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-semibold mb-2 md:mb-4">Observation Entry</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-base mb-1 block">Primary Observation</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="period">Period</TabsTrigger>
                <TabsTrigger value="dry">Dry</TabsTrigger>
                <TabsTrigger value="discharge">Discharge</TabsTrigger>
              </TabsList>
              <TabsContent value="period">
                <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={setPrimaryObservation} value={primaryObservation}>
                  {["H", "M", "L", "VL", "B"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`period-${value}`} />
                      <Label htmlFor={`period-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              <TabsContent value="dry">
                <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={setPrimaryObservation} value={primaryObservation}>
                  {["0", "2", "2 W", "4"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`dry-${value}`} />
                      <Label htmlFor={`dry-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              <TabsContent value="discharge">
                <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={setPrimaryObservation} value={primaryObservation}>
                  {["6", "8", "10", "10DL", "10SL", "10WL"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`discharge-${value}`} />
                      <Label htmlFor={`discharge-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {needsSpecifier && (
                  <div className="mt-2">
                    <Label className="mb-1 block">Specifier</Label>
                    <RadioGroup className="grid grid-cols-5 gap-2" onValueChange={setSpecifier} value={specifier}>
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
            <div className="mt-2">
              <Label className="text-base mb-1 block">Secondary Observation</Label>
              <RadioGroup className="grid grid-cols-3 gap-2" onValueChange={setSecondaryObservation} value={secondaryObservation}>
                {["0", "2", "2 W", "4", "6", "8", "10"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`secondary-${value}`} />
                    <Label htmlFor={`secondary-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              {["6", "8", "10"].includes(secondaryObservation) && (
                <div className="mt-2">
                  <Label className="mb-1 block">Secondary Specifier</Label>
                  <RadioGroup className="grid grid-cols-5 gap-2" onValueChange={setSecondarySpecifier} value={secondarySpecifier}>
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
          <div className="mt-2">
            <Label className="text-base mb-1 block">Frequency</Label>
            <RadioGroup className="grid grid-cols-4 gap-2" onValueChange={setFrequency} value={frequency}>
              {["X1", "X2", "X3", "AD"].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`frequency-${value}`} />
                  <Label htmlFor={`frequency-${value}`}>{value}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button className="w-full" size="lg" disabled={!primaryObservation || (frequencyRequired && !frequency)} onClick={handleSave}>
            Save Entry
          </Button>
          {onCancel && (
            <Button className="w-full" size="lg" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      <div className="mt-8 md:mt-0 w-full max-w-xs flex-shrink-0 mx-auto md:mx-0" style={{maxWidth: '100%'}}>
        <Card className="shadow-none border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 w-full" style={{maxWidth: '100%'}}>
          <CardContent className={cn("p-6 flex items-center justify-center h-40 text-xl font-medium") + " text-center" + (getBackgroundColor() ? ` ${getBackgroundColor()}` : "") }>
            {getFormattedEntry() || "Select observation"}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 