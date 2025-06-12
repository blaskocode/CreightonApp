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
  const [specifiers, setSpecifiers] = useState<string[]>(initialSpecifier ? initialSpecifier.split("") : [])
  const [frequency, setFrequency] = useState(initialFrequency)
  const [secondaryObservation, setSecondaryObservation] = useState(initialSecondaryObservation)
  const [secondarySpecifiers, setSecondarySpecifiers] = useState<string[]>(initialSecondarySpecifier ? initialSecondarySpecifier.split("") : [])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState(initialTab)
  const [secondaryTab, setSecondaryTab] = useState("dry")

  useEffect(() => {
    setPrimaryObservation(initialObservation)
    setSpecifiers(initialSpecifier ? initialSpecifier.split("") : [])
    setFrequency(initialFrequency)
    setSecondaryObservation(initialSecondaryObservation)
    setSecondarySpecifiers(initialSecondarySpecifier ? initialSecondarySpecifier.split("") : [])
    setSelectedDate(initialDate)
    setActiveTab(initialTab)
    setSecondaryTab("dry")
  }, [initialObservation, initialSpecifier, initialFrequency, initialSecondaryObservation, initialSecondarySpecifier, initialDate, initialTab])

  // Clear secondary observation/specifier for H, M, Dry, or Discharge primary
  useEffect(() => {
    if (["H", "M", "L", "VL", "B"].includes(primaryObservation)) {
      setSpecifiers([]);
      setFrequency("");
    }
    if (["H", "M", "0", "2", "4", "6", "8", "10"].includes(primaryObservation)) {
      setSecondaryObservation("");
      setSecondarySpecifiers([]);
    }
  }, [primaryObservation]);

  const needsSpecifier = ["6", "8", "10"].includes(primaryObservation)
  const needsSecondary = ["L", "VL", "B"].includes(primaryObservation)

  const getBackgroundColor = () => {
    // const allSpecifiers = [...specifiers, ...secondarySpecifiers];
    if (["H", "M", "L", "VL", "B"].includes(primaryObservation)) {
      return "bg-red-50 dark:bg-red-950/20";
    } else if (["Y", "B", "G", "P"].some(s => specifiers.includes(s))) {
      return "bg-yellow-50 dark:bg-yellow-950/20";
    } else if (["0", "2", "2W","4"].includes(primaryObservation)) {
      return "bg-green-100 dark:bg-green-950/20";
    } else if (
      primaryObservation.startsWith("6") ||
      primaryObservation.startsWith("8") ||
      primaryObservation.startsWith("10")
    ) {
      return "bg-white dark:bg-slate-800";
    }
    return "";
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
    // For discharge: 6, 8, 10
    const match = obs.match(/^(6|8|10)([A-Z]*)$/);
    if (match) {
      return { primary: match[1], specifier: match[2] || "" };
    }
    return { primary: obs, specifier: "" };
  }

  const getFormattedEntry = () => {
    let entry = primaryObservation;
    if (specifiers.length > 0) {
      entry += specifiers.join("");
    }
    if (secondaryObservation) {
      entry += ` ${secondaryObservation}${secondarySpecifiers.length > 0 ? secondarySpecifiers.join("") : ''}`;
    }
    if (frequency && !["H", "M"].includes(primaryObservation)) {
      entry += ` ${frequency}`;
    }
    return entry;
  };

  const dryTypes = ["0", "2", "4"]
  const dischargeTypes = ["6", "8", "10"]
  const frequencyRequired =
    dryTypes.includes(primaryObservation) ||
    dischargeTypes.includes(primaryObservation) ||
    dryTypes.includes(secondaryObservation) ||
    dischargeTypes.includes(secondaryObservation)

  // Specifier logic helpers
  const drySpecifiers = ["W"]
  const dischargeBaseSpecifiers = ["B", "C", "G", "K", "L", "P", "R", "Y"]
  const dischargeExtraSpecifiers = ["D", "S", "W"]

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
    if (specifiers.length > 0 && !validSpecifiers.every(s => specifiers.includes(s))) {
      setSpecifiers(specifiers.filter(s => validSpecifiers.includes(s)));
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
    if (secondarySpecifiers.length > 0 && !validSpecifiers.every(s => secondarySpecifiers.includes(s))) {
      setSecondarySpecifiers(secondarySpecifiers.filter(s => validSpecifiers.includes(s)));
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
    if ((["6", "8", "10"].includes(primaryObservation) && specifiers.length === 0) ||
        (["6", "8", "10"].includes(secondaryObservation) && secondarySpecifiers.length === 0)) {
      setError("A specifier is required for all Discharge (6, 8, 10) observations.");
      return;
    }
    // 3. Frequency required for dry/discharge, not for H/M
    if ((frequencyRequired && !frequency) && !["H", "M"].includes(primaryObservation)) {
      setError("Frequency is required for all Dry and Discharge observations.");
      return;
    }
    onSave({
      observation: getFormattedEntry(),
      specifier: specifiers.join(""),
      frequency,
      secondaryObservation,
      secondarySpecifier: secondarySpecifiers.join(""),
      date: selectedDate || new Date(),
    });
  };

  const handleClear = () => {
    setPrimaryObservation("");
    setSpecifiers([]);
    setFrequency("");
    setSecondaryObservation("");
    setSecondarySpecifiers([]);
  }

  const dischargeSpecifiers = primaryObservation === "10" ? [...dischargeBaseSpecifiers, ...dischargeExtraSpecifiers] : dischargeBaseSpecifiers;

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
                    <Label className="mb-1 block">Specifier(s)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {drySpecifiers.map((value) => (
                        <label key={value} className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={specifiers.includes(value)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSpecifiers([...specifiers, value]);
                              } else {
                                setSpecifiers(specifiers.filter(s => s !== value));
                              }
                            }}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
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
                  <div className="mt-4">
                    <Label>Specifier(s)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dischargeSpecifiers.map((value) => (
                        <label key={value} className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={specifiers.includes(value)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSpecifiers([...specifiers, value]);
                              } else {
                                setSpecifiers(specifiers.filter(s => s !== value));
                              }
                            }}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {(["6", "8"].includes(primaryObservation)) && (
                  <div className="mt-4">
                    <Label>Specifier(s)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dischargeBaseSpecifiers.map((value) => (
                        <label key={value} className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={specifiers.includes(value)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSpecifiers([...specifiers, value]);
                              } else {
                                setSpecifiers(specifiers.filter(s => s !== value));
                              }
                            }}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
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
                      <Label>Secondary Specifier(s)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {drySpecifiers.map((value) => (
                          <label key={value} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={secondarySpecifiers.includes(value)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSecondarySpecifiers([...secondarySpecifiers, value]);
                                } else {
                                  setSecondarySpecifiers(secondarySpecifiers.filter(s => s !== value));
                                }
                              }}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
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
                      <Label>Secondary Specifier(s)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dischargeBaseSpecifiers.map((value) => (
                          <label key={value} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={secondarySpecifiers.includes(value)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSecondarySpecifiers([...secondarySpecifiers, value]);
                                } else {
                                  setSecondarySpecifiers(secondarySpecifiers.filter(s => s !== value));
                                }
                              }}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {["6", "8"].includes(secondaryObservation) && (
                    <div className="mt-4">
                      <Label>Secondary Specifier(s)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dischargeBaseSpecifiers.map((value) => (
                          <label key={value} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={secondarySpecifiers.includes(value)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSecondarySpecifiers([...secondarySpecifiers, value]);
                                } else {
                                  setSecondarySpecifiers(secondarySpecifiers.filter(s => s !== value));
                                }
                              }}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
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
          <Button className="w-full" size="lg" disabled={(frequencyRequired && !frequency)} onClick={handleSave}>
            Save Entry
          </Button>
          <Button className="w-full" size="lg" variant="outline" onClick={handleClear}>
            Clear Entry
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