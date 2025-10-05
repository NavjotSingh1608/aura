"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Activity, AlertCircle } from "lucide-react"

interface ControlPanelProps {
  isListening: boolean
  isSpeechSupported: boolean
  onStartListening: () => void
  onStopListening: () => void
  currentTopic?: string
  teachingPhase?: string
}

export function ControlPanel({
  isListening,
  isSpeechSupported,
  onStartListening,
  onStopListening,
  currentTopic,
  teachingPhase,
}: ControlPanelProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={!isSpeechSupported}
            className={isListening ? "bg-accent hover:bg-accent/90" : "bg-primary hover:bg-primary/90"}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </>
            )}
          </Button>

          {isListening && (
            <div className="flex items-center gap-2 text-accent">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}

          {!isSpeechSupported && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Speech recognition not supported. Try Chrome or Edge browser.</span>
            </div>
          )}
        </div>

        {(currentTopic || teachingPhase) && (
          <div className="flex items-center gap-2">
            {currentTopic && currentTopic !== "general" && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Topic: {currentTopic}
              </Badge>
            )}
            {teachingPhase && (
              <Badge variant="secondary" className="bg-secondary">
                Phase: {teachingPhase}
              </Badge>
            )}
          </div>
        )}
      </div>

      {!isListening && isSpeechSupported && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Click "Start Listening" and allow microphone access. Speak naturally while teaching, and the AI will provide
            suggestions.
          </p>
        </div>
      )}
    </Card>
  )
}
