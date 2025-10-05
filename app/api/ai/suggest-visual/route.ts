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

    const { concept, context } = await request.json()

    if (!concept) {
      return Response.json({ error: "Concept is required" }, { status: 400 })
    }

    // Use Gemini Pro to suggest visual aids
    const { text } = await generateText({
      model: "google/gemini-2.0-flash-exp",
      prompt: `You are an AI teaching assistant helping to create visual aids for classroom teaching.

Concept to visualize: "${concept}"
Context: ${context || "General teaching"}

Suggest the best type of visual aid for this concept. Choose from:
- diagram (for processes, relationships, structures)
- chart (for data, comparisons, trends)
- illustration (for objects, scenes, examples)
- formula (for mathematical expressions)
- timeline (for sequences, history)

Respond in JSON format:
{
  "visualType": "string",
  "description": "string describing what should be shown",
  "elements": ["key elements to include"],
  "reasoning": "why this visual type is best"
}`,
    })

    const suggestion = JSON.parse(text)

    return Response.json({ suggestion })
  } catch (error) {
    console.error("Error suggesting visual:", error)
    return Response.json({ error: "Failed to suggest visual" }, { status: 500 })
  }
}
