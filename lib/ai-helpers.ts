export async function analyzeSpeech(transcript: string, context?: any) {
  try {
    const response = await fetch("/api/ai/analyze-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, context }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze speech")
    }

    const data = await response.json()
    return data.analysis
  } catch (error) {
    console.error("Error in analyzeSpeech:", error)
    return null
  }
}

export async function generateSummary(sessionId: string) {
  try {
    const response = await fetch("/api/ai/generate-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate summary")
    }

    const data = await response.json()
    return data.summary
  } catch (error) {
    console.error("Error in generateSummary:", error)
    return null
  }
}

export async function suggestVisual(concept: string, context?: string) {
  try {
    const response = await fetch("/api/ai/suggest-visual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, context }),
    })

    if (!response.ok) {
      throw new Error("Failed to suggest visual")
    }

    const data = await response.json()
    return data.suggestion
  } catch (error) {
    console.error("Error in suggestVisual:", error)
    return null
  }
}

export async function analyzeDrawing(drawingData: any, context?: string) {
  try {
    const response = await fetch("/api/ai/analyze-drawing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawingData, context }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze drawing")
    }

    const data = await response.json()
    return data.analysis
  } catch (error) {
    console.error("Error in analyzeDrawing:", error)
    return null
  }
}
