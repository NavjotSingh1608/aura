import type { SmartBoardEvent, SmartBoardShape, SmartBoardStroke, Point } from "@/lib/types"

export type DrawingTool = "pen" | "eraser" | "text"

export class SmartBoardService {
  private eventBuffer: SmartBoardEvent[] = []
  private onEventCallback?: (event: SmartBoardEvent) => void
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isDrawing = false
  private currentStroke: Point[] = []

  private currentTool: DrawingTool = "pen"
  private currentColor = "#60a5fa"
  private currentLineWidth = 3
  private history: ImageData[] = []
  private historyStep = -1
  private maxHistorySteps = 50

  private boundHandlers = {
    mousedown: this.handleDrawStart.bind(this),
    mousemove: this.handleDrawMove.bind(this),
    mouseup: this.handleDrawEnd.bind(this),
    mouseleave: this.handleDrawEnd.bind(this),
    touchstart: this.handleTouchStart.bind(this),
    touchmove: this.handleTouchMove.bind(this),
    touchend: this.handleDrawEnd.bind(this),
  }

  constructor(canvasElement?: HTMLCanvasElement) {
    console.log("[v0] SmartBoardService constructor called")
    if (canvasElement) {
      this.initializeCanvas(canvasElement)
    }
  }

  initializeCanvas(canvasElement: HTMLCanvasElement) {
    console.log("[v0] Initializing canvas...")
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext("2d")

    if (this.ctx) {
      this.ctx.strokeStyle = this.currentColor
      this.ctx.lineWidth = this.currentLineWidth
      this.ctx.lineCap = "round"
      this.ctx.lineJoin = "round"

      console.log("[v0] Canvas context configured:", {
        width: canvasElement.width,
        height: canvasElement.height,
        strokeStyle: this.ctx.strokeStyle,
        lineWidth: this.ctx.lineWidth,
      })

      this.saveState()
    } else {
      console.error("[v0] Failed to get canvas context")
      return
    }

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.canvas) {
      console.error("[v0] Cannot setup listeners: canvas is null")
      return
    }

    console.log("[v0] Setting up event listeners...")

    this.canvas.removeEventListener("mousedown", this.boundHandlers.mousedown)
    this.canvas.removeEventListener("mousemove", this.boundHandlers.mousemove)
    this.canvas.removeEventListener("mouseup", this.boundHandlers.mouseup)
    this.canvas.removeEventListener("mouseleave", this.boundHandlers.mouseleave)
    this.canvas.removeEventListener("touchstart", this.boundHandlers.touchstart)
    this.canvas.removeEventListener("touchmove", this.boundHandlers.touchmove)
    this.canvas.removeEventListener("touchend", this.boundHandlers.touchend)

    this.canvas.addEventListener("mousedown", this.boundHandlers.mousedown)
    this.canvas.addEventListener("mousemove", this.boundHandlers.mousemove)
    this.canvas.addEventListener("mouseup", this.boundHandlers.mouseup)
    this.canvas.addEventListener("mouseleave", this.boundHandlers.mouseleave)
    this.canvas.addEventListener("touchstart", this.boundHandlers.touchstart, { passive: false })
    this.canvas.addEventListener("touchmove", this.boundHandlers.touchmove, { passive: false })
    this.canvas.addEventListener("touchend", this.boundHandlers.touchend)

    console.log("[v0] Event listeners attached successfully")
  }

  private handleDrawStart(e: MouseEvent) {
    console.log("[v0] handleDrawStart called!")
    this.isDrawing = true
    this.currentStroke = []
    const point = this.getMousePos(e)
    this.currentStroke.push(point)

    if (this.ctx && this.canvas) {
      console.log("[v0] Starting new path at", point.x, point.y)

      if (this.currentTool === "eraser") {
        this.ctx.globalCompositeOperation = "destination-out"
        this.ctx.lineWidth = this.currentLineWidth * 3 // Eraser is wider
      } else {
        this.ctx.globalCompositeOperation = "source-over"
        this.ctx.strokeStyle = this.currentColor
        this.ctx.lineWidth = this.currentLineWidth
      }

      this.ctx.beginPath()
      this.ctx.moveTo(point.x, point.y)
    } else {
      console.error("[v0] No context or canvas available!")
    }
  }

  private handleDrawMove(e: MouseEvent) {
    if (!this.isDrawing) return
    if (!this.ctx) {
      console.error("[v0] No context in handleDrawMove!")
      return
    }

    const point = this.getMousePos(e)
    this.currentStroke.push(point)

    this.ctx.lineTo(point.x, point.y)
    this.ctx.stroke()

    if (this.currentStroke.length % 10 === 0) {
      console.log("[v0] Drawing progress:", this.currentStroke.length, "points")
    }
  }

  private handleDrawEnd() {
    if (!this.isDrawing) return

    console.log("[v0] Draw end, stroke length:", this.currentStroke.length)

    this.isDrawing = false

    this.saveState()

    if (this.ctx) {
      this.ctx.globalCompositeOperation = "source-over"
    }

    if (this.currentStroke.length > 2 && this.currentTool === "pen") {
      const shape = this.detectShape(this.currentStroke)

      if (shape) {
        console.log("[v0] Shape detected:", shape.shapeType)
        this.emitEvent(shape)
      } else {
        const stroke: SmartBoardStroke = {
          type: "stroke",
          timestamp: Date.now(),
          points: this.currentStroke,
          color: this.currentColor,
          thickness: this.currentLineWidth,
        }
        console.log("[v0] Stroke emitted")
        this.emitEvent(stroke)
      }
    }

    this.currentStroke = []
  }

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault()
    console.log("[v0] Touch start")
    const touch = e.touches[0]
    const rect = this.canvas?.getBoundingClientRect()
    if (!rect) return

    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
    })
    this.handleDrawStart(mouseEvent as any)
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = this.canvas?.getBoundingClientRect()
    if (!rect) return

    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
    })
    this.handleDrawMove(mouseEvent as any)
  }

  private getMousePos(e: MouseEvent): Point {
    if (!this.canvas) return { x: 0, y: 0 }

    const rect = this.canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  private detectShape(points: Point[]): SmartBoardShape | null {
    if (points.length < 10) return null

    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const distance = Math.sqrt(Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2))

    const isClosed = distance < 30

    if (!isClosed) return null

    const simplifiedPoints = this.simplifyStroke(points)

    if (simplifiedPoints.length >= 3) {
      return {
        type: "shape",
        timestamp: Date.now(),
        shapeType: this.guessShapeType(simplifiedPoints),
        points: simplifiedPoints,
        isClosed: true,
        color: this.currentColor,
        thickness: this.currentLineWidth,
      }
    }

    return null
  }

  private simplifyStroke(points: Point[]): Point[] {
    const tolerance = 15
    return this.douglasPeucker(points, tolerance)
  }

  private douglasPeucker(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points

    let maxDistance = 0
    let index = 0

    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], firstPoint, lastPoint)
      if (distance > maxDistance) {
        maxDistance = distance
        index = i
      }
    }

    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, index + 1), tolerance)
      const right = this.douglasPeucker(points.slice(index), tolerance)
      return [...left.slice(0, -1), ...right]
    } else {
      return [firstPoint, lastPoint]
    }
  }

  private perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y

    const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x)
    const denominator = Math.sqrt(dx * dx + dy * dy)

    return numerator / denominator
  }

  private guessShapeType(points: Point[]): any {
    const numPoints = points.length

    console.log("[v0] Guessing shape type for", numPoints, "points")

    if (numPoints === 3) return "triangle"
    if (numPoints === 4) return "rectangle"
    if (numPoints === 6) return "hexagon"
    if (numPoints >= 8) return "circle"

    return "polygon"
  }

  private emitEvent(event: SmartBoardEvent) {
    this.eventBuffer.push(event)
    this.cleanupOldEvents()

    if (this.onEventCallback) {
      this.onEventCallback(event)
    }
  }

  onEvent(callback: (event: SmartBoardEvent) => void) {
    this.onEventCallback = callback
  }

  getRecentEvents(duration = 10000): SmartBoardEvent[] {
    const cutoff = Date.now() - duration
    return this.eventBuffer.filter((e) => e.timestamp > cutoff)
  }

  private cleanupOldEvents() {
    const cutoff = Date.now() - 30000
    this.eventBuffer = this.eventBuffer.filter((e) => e.timestamp > cutoff)
  }

  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.saveState()
      console.log("[v0] Canvas cleared")
    }
  }

  displayImage(imageUrl: string, position: { x: number; y: number }, size: { width: number; height: number }) {
    if (!this.ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      this.ctx?.drawImage(img, position.x, position.y, size.width, size.height)
    }
    img.src = imageUrl
  }

  setTool(tool: DrawingTool) {
    this.currentTool = tool
    console.log("[v0] Tool changed to:", tool)
  }

  setColor(color: string) {
    this.currentColor = color
    if (this.ctx) {
      this.ctx.strokeStyle = color
    }
    console.log("[v0] Color changed to:", color)
  }

  setLineWidth(width: number) {
    this.currentLineWidth = width
    if (this.ctx) {
      this.ctx.lineWidth = width
    }
    console.log("[v0] Line width changed to:", width)
  }

  getCurrentTool(): DrawingTool {
    return this.currentTool
  }

  getCurrentColor(): string {
    return this.currentColor
  }

  getCurrentLineWidth(): number {
    return this.currentLineWidth
  }

  private saveState() {
    if (!this.canvas || !this.ctx) return

    // Remove any states after current step
    this.history = this.history.slice(0, this.historyStep + 1)

    // Save current state
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.history.push(imageData)
    this.historyStep++

    // Limit history size
    if (this.history.length > this.maxHistorySteps) {
      this.history.shift()
      this.historyStep--
    }

    console.log("[v0] State saved, history step:", this.historyStep)
  }

  undo() {
    if (!this.canvas || !this.ctx || this.historyStep <= 0) {
      console.log("[v0] Cannot undo")
      return
    }

    this.historyStep--
    const imageData = this.history[this.historyStep]
    this.ctx.putImageData(imageData, 0, 0)
    console.log("[v0] Undo to step:", this.historyStep)
  }

  redo() {
    if (!this.canvas || !this.ctx || this.historyStep >= this.history.length - 1) {
      console.log("[v0] Cannot redo")
      return
    }

    this.historyStep++
    const imageData = this.history[this.historyStep]
    this.ctx.putImageData(imageData, 0, 0)
    console.log("[v0] Redo to step:", this.historyStep)
  }

  canUndo(): boolean {
    return this.historyStep > 0
  }

  canRedo(): boolean {
    return this.historyStep < this.history.length - 1
  }
}
