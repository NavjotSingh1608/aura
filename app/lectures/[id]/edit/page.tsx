import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { LectureForm } from "@/components/lecture-form"

export default async function EditLecturePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: lecture } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", params.id)
    .eq("teacher_id", user.id)
    .single()

  if (!lecture) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Lecture</h1>
        <p className="text-muted-foreground mt-1">Update your lecture template</p>
      </div>

      <LectureForm lecture={lecture} />
    </div>
  )
}
