import type { FusedContext, SpeechTranscript, SmartBoardEvent, SpeechIntent } from "@/lib/types"
import { SpeechAnalyzer } from "@/lib/speech-analyzer"

export class DataFusionService {
  private speechTranscripts: SpeechTranscript[] = []
  private boardEvents: SmartBoardEvent[] = []
  private currentContext: FusedContext | null = null

  updateSpeech(transcript: SpeechTranscript) {
    this.speechTranscripts.push(transcript)
    this.cleanupOldData()
    this.updateContext()
  }

  updateBoard(event: SmartBoardEvent) {
    this.boardEvents.push(event)
    this.cleanupOldData()
    this.updateContext()
  }

  private updateContext() {
    const recentTranscripts = this.getRecentTranscripts(30000)
    const recentEvents = this.getRecentEvents(10000)

    // Analyze speech to get intent
    let intent: SpeechIntent | null = null
    if (recentTranscripts.length > 0) {
      const latestTranscript = recentTranscripts[recentTranscripts.length - 1]
      intent = SpeechAnalyzer.analyzeSpeech(latestTranscript, recentTranscripts)
    }

    // Extract current topic
    const currentTopic = intent?.detectedTopic || "general"

    // Get current shapes
    const currentShapes = recentEvents.filter((e) => e.type === "shape") as any[]

    // Determine teaching phase
    const teachingPhase = intent?.teachingPhase || "explanation"

    this.currentContext = {
      timestamp: Date.now(),
      speech: {
        recentTranscripts,
        currentTopic,
        intent,
      },
      board: {
        recentEvents,
        currentShapes,
        lastActivity: recentEvents.length > 0 ? recentEvents[recentEvents.length - 1].timestamp : 0,
      },
      analysis: {
        topic: currentTopic,
        teachingPhase,
        suggestedActions: [],
      },
    }
  }

  getContext(): FusedContext | null {
    return this.currentContext
  }

  private getRecentTranscripts(duration: number): SpeechTranscript[] {
    const cutoff = Date.now() - duration
    return this.speechTranscripts.filter((t) => t.timestamp > cutoff)
  }

  private getRecentEvents(duration: number): SmartBoardEvent[] {
    const cutoff = Date.now() - duration
    return this.boardEvents.filter((e) => e.timestamp > cutoff)
  }

  private cleanupOldData() {
    const cutoff = Date.now() - 60000 // Keep last 60 seconds

    this.speechTranscripts = this.speechTranscripts.filter((t) => t.timestamp > cutoff)
    this.boardEvents = this.boardEvents.filter((e) => e.timestamp > cutoff)
  }

  getRecentSpeechText(duration = 30000): string {
    const transcripts = this.getRecentTranscripts(duration)
    return transcripts.map((t) => t.text).join(" ")
  }
}
