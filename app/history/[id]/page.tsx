import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, BookOpen, Users, Sparkles } from "lucide-react"

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: session } = await supabase
    .from("lecture_sessions")
    .select(`
      *,
      lectures (title, subject),
      groups (name)
    `)
    .eq("id", params.id)
    .eq("teacher_id", user.id)
    .single()

  if (!session) {
    notFound()
  }

  // Fetch AI suggestions for this session
  const { data: suggestions } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/history">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{session.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(session.started_at).toLocaleDateString()} at {new Date(session.started_at).toLocaleTimeString()}
            </span>
            {session.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.duration_minutes} minutes
              </span>
            )}
            {session.groups?.name && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {session.groups.name}
              </span>
            )}
            {session.lectures && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {session.lectures.title}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {session.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Lecture Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{session.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          {session.transcript && (
            <Card>
              <CardHeader>
                <CardTitle>Full Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{session.transcript}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Canvas Data */}
          {session.canvas_data && (
            <Card>
              <CardHeader>
                <CardTitle>Board Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Canvas data saved (visualization coming soon)</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={suggestion.was_accepted ? "default" : "secondary"}>
                          {suggestion.suggestion_type}
                        </Badge>
                        {suggestion.was_accepted && <span className="text-xs text-muted-foreground">Accepted</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Started</p>
                <p className="text-sm text-muted-foreground">{new Date(session.started_at).toLocaleString()}</p>
              </div>
              {session.ended_at && (
                <div>
                  <p className="text-sm font-medium text-foreground">Ended</p>
                  <p className="text-sm text-muted-foreground">{new Date(session.ended_at).toLocaleString()}</p>
                </div>
              )}
              {session.lectures && (
                <div>
                  <p className="text-sm font-medium text-foreground">Lecture Template</p>
                  <p className="text-sm text-muted-foreground">{session.lectures.title}</p>
                  {session.lectures.subject && (
                    <p className="text-xs text-muted-foreground">{session.lectures.subject}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
