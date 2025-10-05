export type TeachingPhase = "introduction" | "explanation" | "example" | "review" | "assessment"
export type AssistanceType = "diagram" | "correction" | "example" | "clarification" | "none"
export type UrgencyLevel = "immediate" | "helpful" | "optional"
export type ShapeType = "circle" | "rectangle" | "line" | "polygon" | "freeform" | "hexagon" | "triangle"

// Speech-to-Text interfaces
export interface SpeechTranscript {
  text: string
  timestamp: number
  confidence: number
  keywords: string[]
}

export interface SpeechIntent {
  transcript: string
  timestamp: number
  detectedTopic: string
  teachingPhase: TeachingPhase
  visualAidSuggestion: {
    confidence: number
    type: AssistanceType
    specificContent: string
    urgency: UrgencyLevel
  }
}

// Smart Board interfaces
export interface Point {
  x: number
  y: number
}

export interface SmartBoardStroke {
  type: "stroke"
  timestamp: number
  points: Point[]
  color: string
  thickness: number
}

export interface SmartBoardShape {
  type: "shape"
  timestamp: number
  shapeType: ShapeType
  points: Point[]
  isClosed: boolean
  color: string
  thickness: number
}

export interface SmartBoardText {
  type: "text"
  timestamp: number
  text: string
  position: Point
  fontSize: number
  color: string
}

export type SmartBoardEvent = SmartBoardStroke | SmartBoardShape | SmartBoardText

// Shape analysis
export interface ShapeAnalysis {
  regularity: number // 0-1, where 1 is perfect
  shapeType: ShapeType
  suggestedCorrection?: string
  confidence: number
}

// Fused context
export interface FusedContext {
  timestamp: number
  speech: {
    recentTranscripts: SpeechTranscript[]
    currentTopic: string
    intent: SpeechIntent | null
  }
  board: {
    recentEvents: SmartBoardEvent[]
    currentShapes: SmartBoardShape[]
    lastActivity: number
  }
  analysis: {
    topic: string
    teachingPhase: TeachingPhase
    suggestedActions: SuggestionAction[]
  }
}

// AI Suggestions
export interface SuggestionAction {
  id: string
  type: AssistanceType
  message: string
  confidence: number
  urgency: UrgencyLevel
  timestamp: number
  actions: {
    label: string
    action: string
    primary?: boolean
  }[]
  reasoning?: string
  metadata?: {
    diagram?: DiagramData
    isDynamic?: boolean
    [key: string]: unknown
  }
}

// Diagram library
export interface DiagramData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  imageUrl: string
  svgContent?: string
}

// System configuration
export interface SystemConfig {
  confidenceThreshold: number
  maxSuggestions: number
  suggestionTimeout: number
  speechBufferDuration: number
  boardEventBufferDuration: number
  enableProactiveSuggestions: boolean
  enableShapeCorrection: boolean
}
