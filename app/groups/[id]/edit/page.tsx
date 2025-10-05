import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { GroupForm } from "@/components/group-form"

export default async function EditGroupPage({ params }: { params: { id: string } }) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Group</h1>
        <p className="text-muted-foreground mt-1">Update your group information</p>
      </div>

      <GroupForm group={group} />
    </div>
  )
}
