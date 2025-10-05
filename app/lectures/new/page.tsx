import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { LectureForm } from "@/components/lecture-form"

export default async function NewLecturePage() {
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
        <h1 className="text-3xl font-bold text-foreground">Create New Lecture</h1>
        <p className="text-muted-foreground mt-1">Set up a new lecture template</p>
      </div>

      <LectureForm />
    </div>
  )
}
