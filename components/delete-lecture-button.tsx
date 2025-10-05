"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/client"

interface DeleteLectureButtonProps {
  lectureId: string
}

export function DeleteLectureButton({ lectureId }: DeleteLectureButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lecture? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("lectures").delete().eq("id", lectureId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting lecture:", error)
      alert("Failed to delete lecture. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
