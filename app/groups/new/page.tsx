import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { GroupForm } from "@/components/group-form"

export default async function NewGroupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Group</h1>
        <p className="text-muted-foreground mt-1">Set up a new student group or class</p>
      </div>

      <GroupForm />
    </div>
  )
}
