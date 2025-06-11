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

// Helper to parse yyyy-mm-dd to Date
function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to parse yyyy-mm-dd to UTC Date
function parseISODateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Helper function for background color
function getObservationBg(observation: string) {
  // Extract the primary observation (first part)
  const primary = observation.split(' ')[0];
  if (["H", "M", "L", "VL", "B"].includes(primary)) {
    return "bg-red-50 dark:bg-red-950/20";
  } else if (["0", "2", "2W", "2 W", "4"].includes(primary)) {
    return "bg-green-50 dark:bg-green-950/20";
  } else if (
    primary.startsWith("6") ||
    primary.startsWith("8") ||
    primary.startsWith("10") ||
    ["10DL", "10SL", "10WL"].includes(primary)
  ) {
    return "bg-white dark:bg-slate-800";
  }
  return "";
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
    const baseDate = parseISODate(cycle.startDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    numBoxes = Math.max(31, diffDays + 1);
  } else if (cycle.days && cycle.days.length > 0) {
    numBoxes = Math.max(31, cycle.days.length);
  }

  // Split into two rows: 1-31, 32+
  const row1Count = Math.min(31, numBoxes);
  const row2Count = numBoxes > 31 ? numBoxes - 31 : 0;
  const getBoxData = (offset: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const idx = offset + i;
      let dayDate: Date | null = null;
      let dateStr = "";
      let showDate = false;
      if (cycle.id === "current" && cycle.startDate) {
        const baseDate = parseISODate(cycle.startDate);
        dayDate = new Date(baseDate.getTime() + idx * 24 * 60 * 60 * 1000);
        const today = new Date(); today.setHours(0,0,0,0);
        if (dayDate.getTime() <= today.getTime()) {
          dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
          showDate = true;
        }
      } else {
        const day = cycle.days.find((d) => d.dayNumber === idx + 1) || null;
        if (day && day.date) {
          dayDate = parseISODate(day.date);
          dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
          showDate = true;
        }
      }
      return { idx, dayDate, dateStr, showDate };
    });

  const renderRow = (offset: number, count: number) => {
    const totalCols = 31;
    return (
      <>
        {/* Dates row */}
        <div className={`grid grid-cols-${totalCols} gap-1 mb-1`}>
          {getBoxData(offset, count).map(({ idx, dateStr, showDate }) => (
            <div
              key={`date-${idx + 1}`}
              className="text-center text-[10px] text-slate-400 dark:text-slate-500 pb-0.5"
            >
              {showDate ? dateStr : ""}
            </div>
          ))}
          {Array.from({ length: totalCols - count }).map((_, i) => (
            <div key={`date-empty-${offset + count + i + 1}`} />
          ))}
        </div>
        {/* Day numbers row */}
        <div className={`grid grid-cols-${totalCols} gap-1 mb-1`}>
          {Array.from({ length: count }, (_, i) => (
            <div key={`daynum-${offset + i + 1}`} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
              {offset + i + 1}
            </div>
          ))}
          {Array.from({ length: totalCols - count }).map((_, i) => (
            <div key={`daynum-empty-${offset + count + i + 1}`} />
          ))}
        </div>
        {/* Observation boxes row */}
        <div className={`grid grid-cols-${totalCols} gap-1 w-full`}>
          {Array.from({ length: count }).map((_, i) => {
            const idx = offset + i;
            // isEditable must be declared before use
            let isEditable = false;
            let boxDate: Date | null = null;
            let day: CycleDay | null = null;
            if (cycle.id === "current" && cycle.startDate) {
              const baseDate = parseISODate(cycle.startDate);
              boxDate = new Date(baseDate.getTime() + idx * 24 * 60 * 60 * 1000);
              const dateStr = boxDate.toISOString().split("T")[0];
              day = cycle.days.find((d) => d.date === dateStr) || null;
            } else {
              day = cycle.days.find((d) => d.dayNumber === idx + 1) || null;
              if (day && day.date) {
                boxDate = parseISODate(day.date);
              }
            }
            const today = new Date()
            today.setHours(0,0,0,0)
            if (boxDate) boxDate.setHours(0,0,0,0)

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
                key={`box-${idx + 1}`}
                className={cn(
                  "rounded-lg border-2 flex flex-col items-center justify-center text-sm font-medium transition-colors min-h-[72px] sm:min-h-[96px] p-1 w-full",
                  isEditable && "cursor-pointer tap-feedback",
                  isCurrentDay && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                  isPastDay && "border-slate-200 dark:border-slate-800",
                  isFutureDay && "border-slate-100 dark:border-slate-900",
                  isEditable && "hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  !isEditable && "opacity-50",
                  // Color logic for observation
                  day?.observation && getObservationBg(day.observation)
                )}
                style={{ minWidth: 0 }}
                onClick={() => {
                  if (isEditable) {
                    setEditingDay(day || { dayNumber: idx + 1, date: boxDate?.toISOString().split("T")[0] || "", observation: null });
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
                <span className="flex flex-col items-center justify-center w-full h-full text-xs leading-tight">
                  {day?.observation ? (
                    (() => {
                      // Split into parts: primary+specifier, secondary+specifier, frequency
                      const obsParts = day.observation.trim().split(' ');
                      const freqCandidates = ["X1", "X2", "X3", "AD"];
                      let freq = '';
                      if (obsParts.length > 1 && freqCandidates.includes(obsParts[obsParts.length - 1])) {
                        freq = obsParts.pop() || '';
                      }
                      // Primary (may have specifier)
                      const primary = obsParts[0] || '';
                      // Secondary (may have specifier)
                      let secondary = '';
                      if (obsParts.length > 1) {
                        secondary = obsParts.slice(1).join('');
                      }
                      return <>
                        <span>{primary}</span>
                        {secondary && <span>{secondary}</span>}
                        {freq && <span>{freq}</span>}
                      </>;
                    })()
                  ) : (
                    <span className="text-slate-300">&nbsp;</span>
                  )}
                </span>
              </div>
            )
          })}
          {Array.from({ length: totalCols - count }).map((_, i) => (
            <div key={`box-empty-${offset + count + i + 1}`} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className={`min-w-[${row1Count * 40}px]`}>
        {renderRow(0, row1Count)}
        {row2Count > 0 && <div className="mt-2">{renderRow(31, row2Count)}</div>}
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
                let initialSpecifier = ""
                let initialFrequency = ""
                let initialTab = "period"
                let initialSecondaryObservation = ""
                let initialSecondarySpecifier = ""
                if (editingDay.observation) {
                  // Parse: [primary][ [secondary][secondary specifier]][ frequency]
                  const obsStr = editingDay.observation.trim();
                  const freqCandidates = ["X1", "X2", "X3", "AD"];
                  let freq = "";
                  let obsMain = obsStr;
                  // Extract frequency if present
                  for (const f of freqCandidates) {
                    if (obsStr.endsWith(" " + f)) {
                      freq = f;
                      obsMain = obsStr.slice(0, -f.length).trim();
                      break;
                    }
                  }
                  initialFrequency = freq;
                  // Split main part into primary and (optional) secondary+specifier
                  const parts = obsMain.split(" ");
                  // Primary and specifier parsing
                  if (parts[0] === "2W") {
                    initialObservation = "2";
                    initialSpecifier = "W";
                  } else if (["6", "8", "10"].some(val => parts[0].startsWith(val))) {
                    const match = parts[0].match(/^(6|8|10)([A-Z]*)$/);
                    if (match) {
                      initialObservation = match[1];
                      initialSpecifier = match[2] || "";
                    } else {
                      initialObservation = parts[0] || "";
                      initialSpecifier = "";
                    }
                  } else {
                    initialObservation = parts[0] || "";
                    initialSpecifier = "";
                  }
                  // Determine tab
                  if (["0", "2", "4"].includes(initialObservation)) {
                    initialTab = "dry";
                  } else if (["6", "8", "10", "10DL", "10SL", "10WL"].some(type => initialObservation.startsWith(type))) {
                    initialTab = "discharge";
                  } else {
                    initialTab = "period";
                  }
                  // Secondary + specifier
                  if (parts.length > 1) {
                    // e.g., 2W, 10KL, etc.
                    const sec = parts[1];
                    if (["0", "2", "4", "6", "8", "10"].some(val => sec.startsWith(val))) {
                      const match = sec.match(/^(0|2|4|6|8|10)([A-Z]*)$/);
                      if (match) {
                        initialSecondaryObservation = match[1];
                        initialSecondarySpecifier = match[2] || "";
                      }
                    }
                  }
                }
                return {
                  initialObservation,
                  initialSpecifier,
                  initialFrequency,
                  initialTab,
                  initialSecondaryObservation,
                  initialSecondarySpecifier,
                  onSave: async (data) => {
                    await fetch('/api/cycle', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        dayNumber: editingDay.dayNumber,
                        date: editingDay.date, // keep original date for previous cycles
                        observation: data.observation,
                        ...(cycle.id !== 'current' && { cycleId: cycle.id })
                      })
                    })
                    setEditingDay(null)
                    if (onObservationSaved) await onObservationSaved()
                  },
                  onCancel: () => setEditingDay(null),
                  initialDate: new Date(editingDay.date)
                }
              })()}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
