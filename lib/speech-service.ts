import type { SpeechTranscript } from "@/lib/types"
import { SpeechAnalyzer } from "@/lib/speech-analyzer"

export class SpeechService {
  private recognition: any
  private isListening = false
  private transcriptBuffer: SpeechTranscript[] = []
  private onTranscriptCallback?: (transcript: SpeechTranscript) => void

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
        console.log("[v0] Speech recognition initialized")
      } else {
        console.error("[v0] Speech recognition not supported in this browser")
      }
    }
  }

  private setupRecognition() {
    this.recognition.continuous = true
    this.recognition.interimResults = false
    this.recognition.lang = "en-US"

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const text = event.results[last][0].transcript
      const confidence = event.results[last][0].confidence

      console.log("[v0] Speech recognized:", text, "confidence:", confidence)

      const transcript: SpeechTranscript = {
        text,
        timestamp: Date.now(),
        confidence,
        keywords: SpeechAnalyzer.extractKeywords(text),
      }

      this.transcriptBuffer.push(transcript)
      this.cleanupOldTranscripts()

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(transcript)
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error("[v0] Speech recognition error:", event.error)
      if (event.error === "not-allowed") {
        console.error("[v0] Microphone permission denied. Please allow microphone access.")
      } else if (event.error === "no-speech") {
        console.log("[v0] No speech detected, continuing to listen...")
      }
    }

    this.recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      if (this.isListening) {
        console.log("[v0] Restarting speech recognition...")
        try {
          this.recognition.start()
        } catch (e) {
          console.error("[v0] Failed to restart recognition:", e)
        }
      }
    }

    this.recognition.onstart = () => {
      console.log("[v0] Speech recognition started successfully")
    }
  }

  start(onTranscript: (transcript: SpeechTranscript) => void) {
    if (!this.recognition) {
      console.error("[v0] Speech recognition not supported")
      return
    }

    console.log("[v0] Starting speech recognition...")
    this.onTranscriptCallback = onTranscript
    this.isListening = true

    try {
      this.recognition.start()
    } catch (e) {
      console.error("[v0] Error starting speech recognition:", e)
    }
  }

  stop() {
    if (this.recognition) {
      console.log("[v0] Stopping speech recognition...")
      this.isListening = false
      this.recognition.stop()
    }
  }

  getRecentTranscripts(duration = 30000): SpeechTranscript[] {
    const cutoff = Date.now() - duration
    return this.transcriptBuffer.filter((t) => t.timestamp > cutoff)
  }

  private cleanupOldTranscripts() {
    const cutoff = Date.now() - 60000
    this.transcriptBuffer = this.transcriptBuffer.filter((t) => t.timestamp > cutoff)
  }

  isSupported(): boolean {
    return !!this.recognition
  }
}
