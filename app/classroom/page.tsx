"use client"

import { useClassroomAI } from "@/hooks/use-classroom-ai"
import { AssistancePanel } from "@/components/assistance-panel"
import { SmartBoard } from "@/components/smart-board"
import { ControlPanel } from "@/components/control-panel"
import { Brain, Sparkles } from "lucide-react"

export default function ClassroomPage() {
  const {
    isListening,
    isSpeechSupported,
    suggestions,
    context,
    startListening,
    stopListening,
    initializeBoard,
    clearBoard,
    handleSuggestionAction,
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
  } = useClassroomAI()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-balance">Classroom AI Co-Pilot</h1>
                <p className="text-sm text-muted-foreground">Intelligent teaching assistance in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Control Panel */}
          <ControlPanel
            isListening={isListening}
            isSpeechSupported={isSpeechSupported}
            onStartListening={startListening}
            onStopListening={stopListening}
            currentTopic={context?.speech.currentTopic}
            teachingPhase={context?.analysis.teachingPhase}
          />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Smart Board */}
            <div className="lg:col-span-2">
              <SmartBoard
                onInitialize={initializeBoard}
                onClear={clearBoard}
                currentTool={currentTool}
                currentColor={currentColor}
                currentLineWidth={currentLineWidth}
                canUndo={canUndo}
                canRedo={canRedo}
                onToolChange={onToolChange}
                onColorChange={onColorChange}
                onLineWidthChange={onLineWidthChange}
                onUndo={onUndo}
                onRedo={onRedo}
              />
            </div>

            {/* Assistance Panel */}
            <div className="lg:col-span-1">
              <AssistancePanel suggestions={suggestions} onAction={handleSuggestionAction} />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Speech Recognition</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                The AI listens to your teaching and detects key concepts that could benefit from visual aids
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Smart Board Analysis</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Drawings are analyzed for shape regularity and the AI suggests perfect diagrams when needed
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Proactive Suggestions</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Context-aware recommendations appear at the right moment to enhance your teaching
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
