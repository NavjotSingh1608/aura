import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { History, Clock, BookOpen } from "lucide-react"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: sessions } = await supabase
    .from("lecture_sessions")
    .select(`
      *,
      lectures (title),
      groups (name)
    `)
    .eq("teacher_id", user.id)
    .order("started_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teaching History</h1>
        <p className="text-muted-foreground mt-1">View and review your past teaching sessions</p>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(session.started_at).toLocaleDateString()} at{" "}
                        {new Date(session.started_at).toLocaleTimeString()}
                      </span>
                      {session.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          {session.duration_minutes} minutes
                        </span>
                      )}
                      {session.groups?.name && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {session.groups.name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/history/${session.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardHeader>
              {session.summary && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{session.summary}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No teaching sessions yet</h3>
            <p className="text-muted-foreground text-center mb-6">Start teaching to build your history</p>
            <Button asChild>
              <Link href="/classroom">Start Teaching</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
