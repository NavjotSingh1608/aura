import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Edit, History } from "lucide-react"

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", params.id)
    .eq("teacher_id", user.id)
    .single()

  if (!group) {
    notFound()
  }

  // Fetch sessions for this group
  const { data: sessions } = await supabase
    .from("lecture_sessions")
    .select("*")
    .eq("group_id", group.id)
    .order("started_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
          <p className="text-muted-foreground mt-1">Created {new Date(group.created_at).toLocaleDateString()}</p>
        </div>
        <Button asChild>
          <Link href={`/groups/${group.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Group
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Group Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{group.description || "No description provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Total Sessions</p>
              <p className="text-sm text-muted-foreground">{sessions?.length || 0} teaching sessions</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString()} at{" "}
                        {new Date(session.started_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/history/${session.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions yet with this group</p>
                <Button asChild className="mt-4">
                  <Link href={`/classroom?groupId=${group.id}`}>Start First Session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
