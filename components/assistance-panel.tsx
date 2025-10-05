"use client"

import { Card } from "@/components/ui/card"
import { SuggestionCard } from "@/components/suggestion-card"
import type { SuggestionAction } from "@/lib/types"
import { Brain, Sparkles } from "lucide-react"

interface AssistancePanelProps {
  suggestions: SuggestionAction[]
  onAction: (suggestionId: string, action: string) => void
}

export function AssistancePanel({ suggestions, onAction }: AssistancePanelProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
          <div className="relative">
            <Brain className="h-12 w-12 text-muted-foreground/50" />
            <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">AI Co-Pilot Ready</h3>
            <p className="text-sm text-muted-foreground text-pretty max-w-[300px]">
              Start teaching and I'll provide helpful suggestions in real-time
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">AI Suggestions</h2>
        <span className="text-xs text-muted-foreground">({suggestions.length})</span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} onAction={onAction} />
        ))}
      </div>
    </div>
  )
}
