import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, BookOpen, Users, History, Zap } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Classroom AI Co-Pilot</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-foreground text-balance">
            Intelligent Teaching Assistance in Real-Time
          </h2>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Transform your classroom with AI-powered suggestions, smart board analysis, and automatic lecture summaries
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Start Teaching Smarter</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">AI-Powered Suggestions</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Get context-aware recommendations and visual aids as you teach, powered by advanced AI
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Smart Board Analysis</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Draw naturally and let AI suggest perfect diagrams and illustrations when needed
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Lecture History</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Automatically save and summarize your lectures for easy review and sharing
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Group Management</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Organize students into groups and track their progress across lectures
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Image Generation</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Generate custom images and diagrams on-demand with AI assistance
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Real-Time Analysis</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Speech recognition and context analysis happen in real-time as you teach
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-card border border-border rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground text-balance">Ready to Transform Your Teaching?</h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            Join teachers who are already using AI to enhance their classroom experience
          </p>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
