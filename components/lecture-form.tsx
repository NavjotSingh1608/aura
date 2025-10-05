"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/client"
import { Loader2 } from "lucide-react"

interface LectureFormProps {
  lecture?: {
    id: string
    title: string
    description: string | null
    subject: string | null
  }
}

export function LectureForm({ lecture }: LectureFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: lecture?.title || "",
    description: lecture?.description || "",
    subject: lecture?.subject || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      if (lecture) {
        // Update existing lecture
        const { error } = await supabase
          .from("lectures")
          .update({
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            updated_at: new Date().toISOString(),
          })
          .eq("id", lecture.id)

        if (error) throw error
      } else {
        // Create new lecture
        const { error } = await supabase.from("lectures").insert({
          teacher_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
        })

        if (error) throw error
      }

      router.push("/lectures")
      router.refresh()
    } catch (error) {
      console.error("Error saving lecture:", error)
      alert("Failed to save lecture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lecture ? "Edit Lecture Details" : "Lecture Details"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Algebra"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this lecture covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lecture ? "Update Lecture" : "Create Lecture"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
