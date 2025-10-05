"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eraser, Download, Pencil } from "lucide-react"
import { DrawingToolbar } from "./drawing-toolbar"
import type { DrawingTool } from "@/lib/smart-board-service"

interface SmartBoardProps {
  onInitialize: (canvas: HTMLCanvasElement) => void
  onClear: () => void
  onToolChange?: (tool: DrawingTool) => void
  onColorChange?: (color: string) => void
  onLineWidthChange?: (width: number) => void
  onUndo?: () => void
  onRedo?: () => void
  currentTool?: DrawingTool
  currentColor?: string
  currentLineWidth?: number
  canUndo?: boolean
  canRedo?: boolean
}

export function SmartBoard({
  onInitialize,
  onClear,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onUndo,
  onRedo,
  currentTool = "pen",
  currentColor = "#60a5fa",
  currentLineWidth = 3,
  canUndo = false,
  canRedo = false,
}: SmartBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current
      const container = containerRef.current

      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      console.log("[v0] Canvas sized:", canvas.width, "x", canvas.height)
      console.log("[v0] SmartBoard calling onInitialize with canvas")
      onInitialize(canvas)
      console.log("[v0] SmartBoard onInitialize call complete")

      const handleMouseDown = () => setIsDrawing(true)
      const handleMouseUp = () => setIsDrawing(false)

      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("mouseleave", handleMouseUp)
      canvas.addEventListener("touchstart", handleMouseDown)
      canvas.addEventListener("touchend", handleMouseUp)

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mouseleave", handleMouseUp)
        canvas.removeEventListener("touchstart", handleMouseDown)
        canvas.removeEventListener("touchend", handleMouseUp)
      }
    }
  }, [onInitialize])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "board-content.png"
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  return (
    <Card className="relative overflow-hidden bg-card border-border">
      <div className="absolute top-4 left-4 z-10">
        <DrawingToolbar
          currentTool={currentTool}
          currentColor={currentColor}
          currentLineWidth={currentLineWidth}
          canUndo={canUndo}
          canRedo={canRedo}
          onToolChange={onToolChange || (() => {})}
          onColorChange={onColorChange || (() => {})}
          onLineWidthChange={onLineWidthChange || (() => {})}
          onUndo={onUndo || (() => {})}
          onRedo={onRedo || (() => {})}
        />
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onClear} className="bg-secondary/80 backdrop-blur-sm">
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDownload} className="bg-secondary/80 backdrop-blur-sm">
          <Download className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {isDrawing && (
        <div className="absolute top-20 left-4 z-10 flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-3 py-1.5 rounded-md border border-primary/30">
          <Pencil className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Drawing...</span>
        </div>
      )}

      <div ref={containerRef} className="relative w-full h-[600px] bg-slate-900/50 rounded-lg">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" style={{ touchAction: "none" }} />
      </div>

      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md">
        Click and drag to draw on the board
      </div>
    </Card>
  )
}
