-- Create ai_suggestions table to track AI suggestions made during sessions
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.lecture_sessions(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  was_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_suggestions
CREATE POLICY "Teachers can view suggestions for their sessions"
  ON public.ai_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lecture_sessions
      WHERE lecture_sessions.id = ai_suggestions.session_id
      AND lecture_sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create suggestions for their sessions"
  ON public.ai_suggestions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lecture_sessions
      WHERE lecture_sessions.id = ai_suggestions.session_id
      AND lecture_sessions.teacher_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_session_id ON public.ai_suggestions(session_id);
