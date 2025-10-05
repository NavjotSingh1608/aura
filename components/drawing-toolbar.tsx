"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Pencil, Eraser, Undo2, Redo2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawingToolbarProps {
  currentTool: "pen" | "eraser" | "text"
  currentColor: string
  currentLineWidth: number
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: "pen" | "eraser" | "text") => void
  onColorChange: (color: string) => void
  onLineWidthChange: (width: number) => void
  onUndo: () => void
  onRedo: () => void
}

const COLORS = [
  { name: "Blue", value: "#60a5fa" },
  { name: "Red", value: "#f87171" },
  { name: "Green", value: "#4ade80" },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Purple", value: "#a78bfa" },
  { name: "Orange", value: "#fb923c" },
  { name: "Pink", value: "#f472b6" },
  { name: "White", value: "#ffffff" },
]

const LINE_WIDTHS = [
  { name: "Thin", value: 2 },
  { name: "Medium", value: 4 },
  { name: "Thick", value: 6 },
  { name: "Extra Thick", value: 10 },
]

export function DrawingToolbar({
  currentTool,
  currentColor,
  currentLineWidth,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onUndo,
  onRedo,
}: DrawingToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2">
      {/* Tool Selection */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={currentTool === "pen" ? "default" : "ghost"}
          onClick={() => onToolChange("pen")}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={currentTool === "eraser" ? "default" : "ghost"}
          onClick={() => onToolChange("eraser")}
          className="h-8 w-8 p-0"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Selection */}
      <div className="flex items-center gap-1">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
              currentColor === color.value ? "border-primary ring-2 ring-primary/50" : "border-border",
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Line Width Selection */}
      <div className="flex items-center gap-1">
        {LINE_WIDTHS.map((width) => (
          <Button
            key={width.value}
            size="sm"
            variant={currentLineWidth === width.value ? "default" : "ghost"}
            onClick={() => onLineWidthChange(width.value)}
            className="h-8 px-2"
            title={width.name}
          >
            <div
              className="rounded-full bg-current"
              style={{
                width: `${width.value * 1.5}px`,
                height: `${width.value * 1.5}px`,
              }}
            />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo} className="h-8 w-8 p-0">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo} className="h-8 w-8 p-0">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
