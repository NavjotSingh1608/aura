import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Plus, Edit } from "lucide-react"
import { DeleteLectureButton } from "@/components/delete-lecture-button"

export default async function LecturesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: lectures } = await supabase
    .from("lectures")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lecture Templates</h1>
          <p className="text-muted-foreground mt-1">Create and manage your lecture plans</p>
        </div>
        <Button asChild>
          <Link href="/lectures/new">
            <Plus className="h-4 w-4 mr-2" />
            New Lecture
          </Link>
        </Button>
      </div>

      {lectures && lectures.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((lecture) => (
            <Card key={lecture.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/lectures/${lecture.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteLectureButton lectureId={lecture.id} />
                  </div>
                </div>
                <CardTitle className="mt-4">{lecture.title}</CardTitle>
                <CardDescription>{lecture.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{lecture.description}</p>
                <Button asChild className="w-full">
                  <Link href={`/classroom?lectureId=${lecture.id}`}>Use This Lecture</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No lectures yet</h3>
            <p className="text-muted-foreground text-center mb-6">Create your first lecture template to get started</p>
            <Button asChild>
              <Link href="/lectures/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Lecture
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
