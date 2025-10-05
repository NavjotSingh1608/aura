import type { SpeechTranscript, SpeechIntent, TeachingPhase, AssistanceType, UrgencyLevel } from "@/lib/types"
import { DIAGRAM_KEYWORDS, PHASE_KEYWORDS } from "@/lib/constants"

export class SpeechAnalyzer {
  /**
   * Extract keywords from transcript
   */
  static extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const keywords: string[] = []

    // Check against known diagram keywords
    for (const [category, categoryKeywords] of Object.entries(DIAGRAM_KEYWORDS)) {
      for (const keyword of categoryKeywords) {
        if (text.toLowerCase().includes(keyword)) {
          keywords.push(keyword)
        }
      }
    }

    return [...new Set(keywords)]
  }

  /**
   * Detect teaching phase from transcript
   */
  static detectTeachingPhase(text: string): TeachingPhase {
    const lowerText = text.toLowerCase()

    for (const [phase, keywords] of Object.entries(PHASE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return phase as TeachingPhase
        }
      }
    }

    return "explanation" // Default phase
  }

  /**
   * Detect if visual aid would be helpful
   */
  static shouldSuggestVisualAid(transcript: SpeechTranscript): {
    should: boolean
    type: AssistanceType
    content: string
    confidence: number
    urgency: UrgencyLevel
  } {
    const keywords = transcript.keywords
    const text = transcript.text.toLowerCase()

    const transformPatterns = [
      /turn (?:this|it) into (?:a |an )?(\w+)/i,
      /make (?:this|it) (?:a |an )?(\w+)/i,
      /draw (?:a |an )?(\w+)/i,
      /show (?:me )?(?:a |an )?(\w+)/i,
      /can (?:you |I )?(?:have|get|generate|create|show|make|draw) (?:me )?(?:a |an )?(\w+)/i,
      /(?:please |could you )?(?:generate|create|show|display|make) (?:me )?(?:a |an )?(\w+)/i,
      /(?:I want|I need|give me) (?:a |an )?(\w+)/i,
    ]

    for (const pattern of transformPatterns) {
      const match = transcript.text.match(pattern)
      if (match) {
        // Find the captured group (the object name)
        const objectName = match.find((group, index) => index > 0 && group && group.length > 0)
        if (objectName) {
          console.log("[v0] Detected request for:", objectName)
          return {
            should: true,
            type: "diagram",
            content: objectName,
            confidence: 0.9,
            urgency: "immediate",
          }
        }
      }
    }

    // Check for technical terms that benefit from diagrams
    for (const [category, categoryKeywords] of Object.entries(DIAGRAM_KEYWORDS)) {
      for (const keyword of categoryKeywords) {
        if (keywords.includes(keyword)) {
          console.log("[v0] Detected keyword:", keyword, "in category:", category)
          return {
            should: true,
            type: "diagram",
            content: `${keyword} diagram`,
            confidence: 0.85,
            urgency: this.determineUrgency(text),
          }
        }
      }
    }

    // Check for phrases indicating examples needed
    if (text.includes("for example") || text.includes("for instance")) {
      return {
        should: true,
        type: "example",
        content: "visual example",
        confidence: 0.75,
        urgency: "helpful",
      }
    }

    // Check for clarification requests
    if (text.includes("what is") || text.includes("how does")) {
      return {
        should: true,
        type: "clarification",
        content: "explanation diagram",
        confidence: 0.7,
        urgency: "helpful",
      }
    }

    return {
      should: false,
      type: "none",
      content: "",
      confidence: 0,
      urgency: "optional",
    }
  }

  /**
   * Determine urgency level based on context
   */
  private static determineUrgency(text: string): UrgencyLevel {
    if (text.includes("now") || text.includes("let's") || text.includes("next")) {
      return "immediate"
    }
    if (text.includes("also") || text.includes("additionally")) {
      return "helpful"
    }
    return "optional"
  }

  /**
   * Analyze speech and create intent
   */
  static analyzeSpeech(transcript: SpeechTranscript, recentTranscripts: SpeechTranscript[]): SpeechIntent {
    const keywords = this.extractKeywords(transcript.text)
    const phase = this.detectTeachingPhase(transcript.text)
    const visualAid = this.shouldSuggestVisualAid({ ...transcript, keywords })

    // Determine topic from keywords
    let detectedTopic = "general"
    for (const [category, categoryKeywords] of Object.entries(DIAGRAM_KEYWORDS)) {
      if (keywords.some((k) => categoryKeywords.includes(k))) {
        detectedTopic = category
        break
      }
    }

    return {
      transcript: transcript.text,
      timestamp: transcript.timestamp,
      detectedTopic,
      teachingPhase: phase,
      visualAidSuggestion: {
        confidence: visualAid.confidence,
        type: visualAid.type,
        specificContent: visualAid.content,
        urgency: visualAid.urgency,
      },
    }
  }
}
