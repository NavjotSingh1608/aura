import { createClient } from "@/lib/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { drawingData, context } = await request.json()

    if (!drawingData) {
      return Response.json({ error: "Drawing data is required" }, { status: 400 })
    }

    // Analyze the drawing strokes to detect shapes and patterns
    const { text } = await generateText({
      model: "google/gemini-2.0-flash-exp",
      prompt: `You are an AI teaching assistant analyzing a teacher's whiteboard drawing.

Drawing context: ${context || "Unknown"}
Number of strokes: ${drawingData.objects?.length || 0}

Based on the drawing activity, determine if the teacher is trying to draw:
- A geometric shape (circle, square, triangle, etc.)
- A diagram (flowchart, mind map, etc.)
- A graph or chart
- Mathematical notation
- Other illustration

If the drawing appears irregular or hand-drawn, suggest if a perfect/clean version would be helpful.

Respond in JSON format:
{
  "detectedType": "string",
  "confidence": number (0-1),
  "suggestion": "string describing what could be improved",
  "shouldOfferPerfectVersion": boolean
}`,
    })

    const analysis = JSON.parse(text)

    return Response.json({ analysis })
  } catch (error) {
    console.error("Error analyzing drawing:", error)
    return Response.json({ error: "Failed to analyze drawing" }, { status: 500 })
  }
}
