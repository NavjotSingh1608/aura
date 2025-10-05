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

    const { sessionId } = await request.json()

    if (!sessionId) {
      return Response.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from("lecture_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("teacher_id", user.id)
      .single()

    if (sessionError || !session) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    if (!session.transcript) {
      return Response.json({ error: "No transcript available" }, { status: 400 })
    }

    // Generate summary using Gemini Pro
    const { text: summary } = await generateText({
      model: "google/gemini-2.0-flash-exp",
      prompt: `You are an AI teaching assistant. Summarize the following lecture transcript into a clear, concise summary that captures the main topics, key concepts, and important points discussed.

Lecture Title: ${session.title}
Transcript:
${session.transcript}

Provide a well-structured summary in 2-4 paragraphs that a teacher could use for review or share with students.`,
    })

    // Update the session with the summary
    const { error: updateError } = await supabase.from("lecture_sessions").update({ summary }).eq("id", sessionId)

    if (updateError) {
      throw updateError
    }

    return Response.json({ summary })
  } catch (error) {
    console.error("Error generating summary:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
