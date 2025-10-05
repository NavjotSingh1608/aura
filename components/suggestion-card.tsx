"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SuggestionAction } from "@/lib/types"
import { Lightbulb, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface SuggestionCardProps {
  suggestion: SuggestionAction
  onAction: (suggestionId: string, action: string) => void
}

export function SuggestionCard({ suggestion, onAction }: SuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "diagram":
        return <Sparkles className="h-5 w-5 text-primary" />
      case "correction":
        return <CheckCircle2 className="h-5 w-5 text-accent" />
      case "example":
        return <Lightbulb className="h-5 w-5 text-[oklch(0.75_0.2_50)]" />
      case "clarification":
        return <AlertCircle className="h-5 w-5 text-primary" />
      default:
        return <Sparkles className="h-5 w-5 text-primary" />
    }
  }

  const getUrgencyColor = () => {
    switch (suggestion.urgency) {
      case "immediate":
        return "bg-[oklch(0.75_0.2_50)] text-background"
      case "helpful":
        return "bg-primary/20 text-primary"
      case "optional":
        return "bg-muted text-muted-foreground"
    }
  }

  const confidencePercentage = Math.round(suggestion.confidence * 100)

  const diagram = suggestion.metadata?.diagram

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground text-balance">{suggestion.message}</h3>
              <Badge variant="secondary" className={getUrgencyColor()}>
                {suggestion.urgency}
              </Badge>
            </div>

            {suggestion.reasoning && (
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{suggestion.reasoning}</p>
            )}

            {diagram && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted/30">
                <Image
                  src={diagram.imageUrl || "/placeholder.svg"}
                  alt={diagram.title}
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain max-h-[200px]"
                  unoptimized
                />
                <div className="p-2 bg-muted/50">
                  <p className="text-xs text-muted-foreground">{diagram.description}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Confidence:</span>
              <div className="flex-1 max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${confidencePercentage}%` }} />
              </div>
              <span>{confidencePercentage}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {suggestion.actions.map((action) => (
              <Button
                key={action.action}
                size="sm"
                variant={action.primary ? "default" : "outline"}
                onClick={() => onAction(suggestion.id, action.action)}
                className={action.primary ? "bg-primary hover:bg-primary/90" : ""}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
