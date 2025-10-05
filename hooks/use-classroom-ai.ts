"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import type { SuggestionAction, FusedContext, SpeechTranscript, SmartBoardEvent } from "@/lib/types"
import { SpeechService } from "@/lib/speech-service"
import { SmartBoardService, type DrawingTool } from "@/lib/smart-board-service"
import { DataFusionService } from "@/lib/data-fusion-service"
import { AISuggestionService } from "@/lib/ai-suggestion-service"

export function useClassroomAI() {
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionAction[]>([])
  const [context, setContext] = useState<FusedContext | null>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)

  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen")
  const [currentColor, setCurrentColor] = useState("#60a5fa")
  const [currentLineWidth, setCurrentLineWidth] = useState(3)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const speechServiceRef = useRef<SpeechService>(
    useMemo(() => {
      console.log("[v0] Creating SpeechService")
      return new SpeechService()
    }, []),
  )

  const boardServiceRef = useRef<SmartBoardService>(
    useMemo(() => {
      console.log("[v0] Creating SmartBoardService")
      return new SmartBoardService()
    }, []),
  )

  const fusionServiceRef = useRef<DataFusionService>(
    useMemo(() => {
      console.log("[v0] Creating DataFusionService")
      return new DataFusionService()
    }, []),
  )

  const suggestionServiceRef = useRef<AISuggestionService>(
    useMemo(() => {
      console.log("[v0] Creating AISuggestionService")
      return new AISuggestionService()
    }, []),
  )

  useEffect(() => {
    setIsSpeechSupported(speechServiceRef.current.isSupported())

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop()
      }
    }
  }, [])

  const handleTranscript = useCallback((transcript: SpeechTranscript) => {
    console.log("[v0] Transcript:", transcript.text)

    if (fusionServiceRef.current) {
      fusionServiceRef.current.updateSpeech(transcript)
      const newContext = fusionServiceRef.current.getContext()

      if (newContext && suggestionServiceRef.current) {
        const newSuggestions = suggestionServiceRef.current.generateSuggestions(newContext)
        setSuggestions(newSuggestions)
        setContext(newContext)
      }
    }
  }, [])

  const handleBoardEvent = useCallback((event: SmartBoardEvent) => {
    console.log("[v0] Board event:", event.type)

    if (fusionServiceRef.current) {
      fusionServiceRef.current.updateBoard(event)
      const newContext = fusionServiceRef.current.getContext()

      if (newContext && suggestionServiceRef.current) {
        const newSuggestions = suggestionServiceRef.current.generateSuggestions(newContext)
        setSuggestions(newSuggestions)
        setContext(newContext)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (speechServiceRef.current) {
      speechServiceRef.current.start(handleTranscript)
      setIsListening(true)
    }
  }, [handleTranscript])

  const stopListening = useCallback(() => {
    if (speechServiceRef.current) {
      speechServiceRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const initializeBoard = useCallback(
    (canvas: HTMLCanvasElement) => {
      console.log("[v0] initializeBoard called with canvas:", canvas)
      console.log("[v0] boardServiceRef.current exists:", !!boardServiceRef.current)

      console.log("[v0] Calling boardService.initializeCanvas...")
      boardServiceRef.current.initializeCanvas(canvas)
      boardServiceRef.current.onEvent(handleBoardEvent)
      console.log("[v0] Board initialization complete")

      updateUndoRedoState()
    },
    [handleBoardEvent],
  )

  const clearBoard = useCallback(() => {
    if (boardServiceRef.current) {
      boardServiceRef.current.clearCanvas()
      updateUndoRedoState()
    }
  }, [])

  const handleToolChange = useCallback((tool: DrawingTool) => {
    if (boardServiceRef.current) {
      boardServiceRef.current.setTool(tool)
      setCurrentTool(tool)
    }
  }, [])

  const handleColorChange = useCallback((color: string) => {
    if (boardServiceRef.current) {
      boardServiceRef.current.setColor(color)
      setCurrentColor(color)
    }
  }, [])

  const handleLineWidthChange = useCallback((width: number) => {
    if (boardServiceRef.current) {
      boardServiceRef.current.setLineWidth(width)
      setCurrentLineWidth(width)
    }
  }, [])

  const updateUndoRedoState = useCallback(() => {
    if (boardServiceRef.current) {
      setCanUndo(boardServiceRef.current.canUndo())
      setCanRedo(boardServiceRef.current.canRedo())
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (boardServiceRef.current) {
      boardServiceRef.current.undo()
      updateUndoRedoState()
    }
  }, [updateUndoRedoState])

  const handleRedo = useCallback(() => {
    if (boardServiceRef.current) {
      boardServiceRef.current.redo()
      updateUndoRedoState()
    }
  }, [updateUndoRedoState])

  const displayDiagram = useCallback((diagramId: string, suggestion?: SuggestionAction) => {
    console.log("[v0] displayDiagram called with ID:", diagramId)

    if (!boardServiceRef.current) {
      console.error("[v0] Board service not available")
      return
    }

    // Check if this is a dynamic diagram
    if (diagramId.startsWith("dynamic-")) {
      console.log("[v0] Displaying dynamic diagram")
      // Get diagram from suggestion metadata
      const diagram = suggestion?.metadata?.diagram
      if (diagram) {
        console.log("[v0] Dynamic diagram URL:", diagram.imageUrl)
        boardServiceRef.current.displayImage(diagram.imageUrl, { x: 50, y: 50 }, { width: 400, height: 400 })
      } else {
        console.error("[v0] No diagram data in suggestion metadata")
      }
    } else {
      // Get from library
      console.log("[v0] Displaying library diagram")
      if (suggestionServiceRef.current) {
        const diagram = suggestionServiceRef.current.getDiagramById(diagramId)
        if (diagram) {
          console.log("[v0] Library diagram URL:", diagram.imageUrl)
          boardServiceRef.current.displayImage(diagram.imageUrl, { x: 50, y: 50 }, { width: 400, height: 400 })
        } else {
          console.error("[v0] Diagram not found in library:", diagramId)
        }
      }
    }
  }, [])

  const dismissSuggestion = useCallback((id: string) => {
    if (suggestionServiceRef.current) {
      suggestionServiceRef.current.dismissSuggestion(id)
      setSuggestions(suggestionServiceRef.current.getActiveSuggestions())
    }
  }, [])

  const handleSuggestionAction = useCallback(
    (suggestionId: string, action: string) => {
      console.log("[v0] handleSuggestionAction:", suggestionId, action)

      // Find the suggestion to get its metadata
      const suggestion = suggestions.find((s) => s.id === suggestionId)

      if (action === "dismiss") {
        dismissSuggestion(suggestionId)
        return
      }

      if (action.startsWith("display-diagram:")) {
        const diagramId = action.split(":")[1]
        console.log("[v0] Displaying diagram:", diagramId)
        displayDiagram(diagramId, suggestion)
        dismissSuggestion(suggestionId)
        return
      }

      if (action.startsWith("correct-shape:")) {
        // Shape correction would be implemented here
        dismissSuggestion(suggestionId)
        return
      }

      // Handle other actions
      dismissSuggestion(suggestionId)
    },
    [dismissSuggestion, displayDiagram, suggestions],
  )

  return {
    isListening,
    isSpeechSupported,
    suggestions,
    context,
    startListening,
    stopListening,
    initializeBoard,
    clearBoard,
    displayDiagram,
    dismissSuggestion,
    handleSuggestionAction,
    currentTool,
    currentColor,
    currentLineWidth,
    canUndo,
    canRedo,
    onToolChange: handleToolChange,
    onColorChange: handleColorChange,
    onLineWidthChange: handleLineWidthChange,
    onUndo: handleUndo,
    onRedo: handleRedo,
  }
}
