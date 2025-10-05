import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Users, History, Plus, Play } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch stats
  const { count: lecturesCount } = await supabase
    .from("lectures")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id)

  const { count: groupsCount } = await supabase
    .from("groups")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id)

  const { count: sessionsCount } = await supabase
    .from("lecture_sessions")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id)

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from("lecture_sessions")
    .select("*")
    .eq("teacher_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || "Teacher"}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your teaching today</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild size="lg" className="h-auto py-6">
          <Link href="/classroom" className="flex flex-col items-center gap-2">
            <Play className="h-6 w-6" />
            <span>Start Teaching</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto py-6 bg-transparent">
          <Link href="/lectures/new" className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span>New Lecture</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto py-6 bg-transparent">
          <Link href="/groups/new" className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span>New Group</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto py-6 bg-transparent">
          <Link href="/history" className="flex flex-col items-center gap-2">
            <History className="h-6 w-6" />
            <span>View History</span>
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Lecture templates created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Sessions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total sessions completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Teaching Sessions</CardTitle>
          <CardDescription>Your latest classroom activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.started_at).toLocaleDateString()} at{" "}
                      {new Date(session.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/history/${session.id}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teaching sessions yet</p>
              <Button asChild className="mt-4">
                <Link href="/classroom">Start Your First Session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
