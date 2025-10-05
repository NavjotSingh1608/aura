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

    const { transcript, context } = await request.json()

    if (!transcript) {
      return Response.json({ error: "Transcript is required" }, { status: 400 })
    }

    // Use Gemini Pro to analyze the speech
    const { text } = await generateText({
      model: "google/gemini-2.0-flash-exp",
      prompt: `You are an AI teaching assistant analyzing a classroom lecture in real-time.

Current transcript: "${transcript}"

Previous context: ${context ? JSON.stringify(context) : "None"}

Analyze the speech and provide:
1. Current topic being discussed
2. Teaching phase (introduction, explanation, example, practice, summary)
3. Key concepts mentioned
4. Suggested visual aids or diagrams that would help
5. Whether the teacher seems to need assistance

Respond in JSON format:
{
  "currentTopic": "string",
  "teachingPhase": "string",
  "keyConcepts": ["string"],
  "suggestedVisuals": ["string"],
  "needsAssistance": boolean,
  "assistanceReason": "string or null"
}`,
    })

    const analysis = JSON.parse(text)

    return Response.json({ analysis })
  } catch (error) {
    console.error("Error analyzing speech:", error)
    return Response.json({ error: "Failed to analyze speech" }, { status: 500 })
  }
}
