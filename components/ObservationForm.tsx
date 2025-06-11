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
  const [secondaryTab, setSecondaryTab] = useState("dry")
  const [validObservationOptions, setValidObservationOptions] = useState<Set<string>>(new Set())

  useEffect(() => {
    setPrimaryObservation(initialObservation)
    setSpecifier(initialSpecifier)
    setFrequency(initialFrequency)
    setSecondaryObservation(initialSecondaryObservation)
    setSecondarySpecifier(initialSecondarySpecifier)
    setSelectedDate(initialDate)
    setActiveTab(initialTab)
    setSecondaryTab("dry")
  }, [initialObservation, initialSpecifier, initialFrequency, initialSecondaryObservation, initialSecondarySpecifier, initialDate, initialTab])

  useEffect(() => {
    fetch('/api/valid-observations')
      .then(res => res.json())
      .then((data: string[]) => setValidObservationOptions(new Set(data)));
  }, []);

  // Clear secondary observation/specifier for H, M, Dry, or Discharge primary
  useEffect(() => {
    if (["H", "M", "0", "2", "4", "6", "8", "10", "10DL", "10SL", "10WL"].includes(primaryObservation)) {
      setSecondaryObservation("");
      setSecondarySpecifier("");
    }
  }, [primaryObservation]);

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

  // Helper: parse primary+specifier from observation string
  function parsePrimaryAndSpecifier(obs: string) {
    // For period: H, M, L, VL, B (no specifier for H/M/L/VL/B)
    if (["H", "M", "L", "VL", "B"].includes(obs)) return { primary: obs, specifier: "" };
    // For dry: 0, 2, 2W, 4
    if (["0", "4"].includes(obs)) return { primary: obs, specifier: "" };
    if (obs.startsWith("2")) {
      if (obs === "2") return { primary: "2", specifier: "" };
      if (obs === "2W") return { primary: "2", specifier: "W" };
    }
    // For discharge: 6, 8, 10, 10DL, 10SL, 10WL, etc.
    const match = obs.match(/^(6|8|10)([A-Z]*)$/);
    if (match) {
      return { primary: match[1], specifier: match[2] || "" };
    }
    return { primary: obs, specifier: "" };
  }

  const getFormattedEntry = () => {
    let entry = primaryObservation;
    // For 2W, concatenate specifier to primary
    if (primaryObservation === "2" && specifier === "W") {
      entry = "2W";
    } else if (specifier && ["6", "8", "10"].includes(primaryObservation)) {
      entry = primaryObservation + specifier;
    }
    // Add secondary observation and specifier if present
    if (secondaryObservation) {
      entry += ` ${secondaryObservation}${secondarySpecifier ? secondarySpecifier : ''}`;
    }
    // Add frequency if present and not H/M
    if (frequency && !["H", "M"].includes(primaryObservation)) {
      entry += ` ${frequency}`;
    }
    return entry;
  };

  const dryTypes = ["0", "2", "2 W", "4"]
  const dischargeTypes = ["6", "8", "10", "10DL", "10SL", "10WL"]
  const frequencyRequired =
    dryTypes.includes(primaryObservation) ||
    dischargeTypes.includes(primaryObservation) ||
    dryTypes.includes(secondaryObservation) ||
    dischargeTypes.includes(secondaryObservation)

  // Specifier logic helpers
  const drySpecifiers = ["W"]
  const dischargeBaseSpecifiers = ["B", "C", "C/K", "G", "K", "KL", "L", "P", "R", "Y"]
  const dischargeExtraSpecifiers = ["DL", "SL", "WL"]

  // Clear specifier if not valid for the current primary observation
  useEffect(() => {
    let validSpecifiers: string[] = [];
    if (primaryObservation === "2") {
      validSpecifiers = drySpecifiers;
    } else if (["6", "8"].includes(primaryObservation)) {
      validSpecifiers = dischargeBaseSpecifiers;
    } else if (primaryObservation === "10") {
      validSpecifiers = [...dischargeBaseSpecifiers, ...dischargeExtraSpecifiers];
    } else {
      validSpecifiers = [];
    }
    if (specifier && !validSpecifiers.includes(specifier)) {
      setSpecifier("");
    }
  }, [primaryObservation]);

  // Clear secondary specifier if not valid for the current secondary observation
  useEffect(() => {
    let validSpecifiers: string[] = [];
    if (secondaryObservation === "2") {
      validSpecifiers = drySpecifiers;
    } else if (["6", "8"].includes(secondaryObservation)) {
      validSpecifiers = dischargeBaseSpecifiers;
    } else if (secondaryObservation === "10") {
      validSpecifiers = [...dischargeBaseSpecifiers, ...dischargeExtraSpecifiers];
    } else {
      validSpecifiers = [];
    }
    if (secondarySpecifier && !validSpecifiers.includes(secondarySpecifier)) {
      setSecondarySpecifier("");
    }
  }, [secondaryObservation]);

  const handleSave = () => {
    setError("");
    // Validation rules
    // 1. If primary is L, VL, or B, require secondary observation
    if (["L", "VL", "B"].includes(primaryObservation) && !secondaryObservation) {
      setError("Secondary observation is required for L, VL, or B.");
      return;
    }
    // 2. If primary or secondary is 6, 8, or 10, require a specifier
    if ((["6", "8", "10"].includes(primaryObservation) && !specifier) ||
        (["6", "8", "10"].includes(secondaryObservation) && !secondarySpecifier)) {
      setError("A specifier is required for all Discharge (6, 8, 10) observations.");
      return;
    }
    // 3. Frequency required for dry/discharge, not for H/M
    if ((frequencyRequired && !frequency) && !["H", "M"].includes(primaryObservation)) {
      setError("Frequency is required for all Dry and Discharge observations.");
      return;
    }
    // 4. Observation string must match valid options
    const obsString = getFormattedEntry();
    if (!validObservationOptions.has(obsString)) {
      setError("This observation is not a valid option.");
      return;
    }
    onSave({
      observation: obsString,
      specifier,
      frequency,
      secondaryObservation,
      secondarySpecifier,
      date: selectedDate || new Date(),
    });
  };

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-8 md:items-start min-w-0">
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-semibold mb-2 md:mb-4">Observation Entry</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-base mb-1 block">Primary Observation</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1 mb-4">
              <TabsList className="grid grid-cols-3 p-0">
                <TabsTrigger value="period" className="px-3 py-0 h-7 text-sm font-medium rounded leading-none transition-colors data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border-none">Period</TabsTrigger>
                <TabsTrigger value="dry" className="px-3 py-0 h-7 text-sm font-medium rounded leading-none transition-colors data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border-none">Dry</TabsTrigger>
                <TabsTrigger value="discharge" className="px-3 py-0 h-7 text-sm font-medium rounded leading-none transition-colors data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border-none">Discharge</TabsTrigger>
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
                  {["0", "2", "4"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`dry-${value}`} />
                      <Label htmlFor={`dry-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {primaryObservation === "2" && (
                  <div className="mt-2">
                    <Label className="mb-1 block">Specifier</Label>
                    <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={setSpecifier} value={specifier}>
                      {drySpecifiers.map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`dry-specifier-${value}`} />
                          <Label htmlFor={`dry-specifier-${value}`}>{value}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="discharge">
                <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={setPrimaryObservation} value={primaryObservation}>
                  {["6", "8", "10"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`discharge-${value}`} />
                      <Label htmlFor={`discharge-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {primaryObservation === "10" && (
                  <div className="mt-2">
                    <Label className="mb-1 block">Specifier</Label>
                    <RadioGroup className="grid grid-cols-3 gap-2" onValueChange={setSpecifier} value={specifier}>
                      {[...dischargeBaseSpecifiers, ...dischargeExtraSpecifiers].map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`discharge-specifier-${value}`} />
                          <Label htmlFor={`discharge-specifier-${value}`}>{value}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                {(["6", "8"].includes(primaryObservation)) && (
                  <div className="mt-2">
                    <Label className="mb-1 block">Specifier</Label>
                    <RadioGroup className="grid grid-cols-5 gap-2" onValueChange={setSpecifier} value={specifier}>
                      {dischargeBaseSpecifiers.map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`discharge-specifier-${value}`} />
                          <Label htmlFor={`discharge-specifier-${value}`}>{value}</Label>
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
              <Tabs value={secondaryTab} onValueChange={setSecondaryTab} className="mt-2 mb-4">
                <TabsList className="grid grid-cols-2 p-0">
                  <TabsTrigger value="dry" className="px-3 py-0 h-7 text-sm font-medium rounded leading-none transition-colors data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border-none">Dry</TabsTrigger>
                  <TabsTrigger value="discharge" className="px-3 py-0 h-7 text-sm font-medium rounded leading-none transition-colors data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border-none">Discharge</TabsTrigger>
                </TabsList>
                <TabsContent value="dry" className="mt-4">
                  <RadioGroup
                    className="grid grid-cols-2 gap-2"
                    onValueChange={setSecondaryObservation}
                    value={secondaryObservation}
                  >
                    {["0", "2", "4"].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`secondary-dry-${value}`} />
                        <Label htmlFor={`secondary-dry-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {secondaryObservation === "2" && (
                    <div className="mt-4">
                      <Label>Secondary Specifier</Label>
                      <RadioGroup className="grid grid-cols-2 gap-2 mt-2" onValueChange={setSecondarySpecifier} value={secondarySpecifier}>
                        {drySpecifiers.map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`secondary-dry-specifier-${value}`} />
                            <Label htmlFor={`secondary-dry-specifier-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="discharge" className="mt-4">
                  <RadioGroup
                    className="grid grid-cols-2 gap-2"
                    onValueChange={setSecondaryObservation}
                    value={secondaryObservation}
                  >
                    {["6", "8", "10"].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`secondary-discharge-${value}`} />
                        <Label htmlFor={`secondary-discharge-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {secondaryObservation === "10" && (
                    <div className="mt-4">
                      <Label>Secondary Specifier</Label>
                      <RadioGroup className="grid grid-cols-3 gap-2 mt-2" onValueChange={setSecondarySpecifier} value={secondarySpecifier}>
                        {[...dischargeBaseSpecifiers, ...dischargeExtraSpecifiers].map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`secondary-discharge-specifier-${value}`} />
                            <Label htmlFor={`secondary-discharge-specifier-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                  {["6", "8"].includes(secondaryObservation) && (
                    <div className="mt-4">
                      <Label>Secondary Specifier</Label>
                      <RadioGroup className="grid grid-cols-5 gap-2 mt-2" onValueChange={setSecondarySpecifier} value={secondarySpecifier}>
                        {dischargeBaseSpecifiers.map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`secondary-discharge-specifier-${value}`} />
                            <Label htmlFor={`secondary-discharge-specifier-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          {/* Frequency input, only if not H or M */}
          {!["H", "M"].includes(primaryObservation) && (
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
          )}
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