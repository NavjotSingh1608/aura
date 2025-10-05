import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, Plus, Edit } from "lucide-react"
import { DeleteGroupButton } from "@/components/delete-group-button"

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Groups</h1>
          <p className="text-muted-foreground mt-1">Organize and manage your classes</p>
        </div>
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Link>
        </Button>
      </div>

      {groups && groups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/groups/${group.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteGroupButton groupId={group.id} />
                  </div>
                </div>
                <CardTitle className="mt-4">{group.name}</CardTitle>
                <CardDescription>Created {new Date(group.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {group.description || "No description"}
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/groups/${group.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
            <p className="text-muted-foreground text-center mb-6">Create your first student group to get started</p>
            <Button asChild>
              <Link href="/groups/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
