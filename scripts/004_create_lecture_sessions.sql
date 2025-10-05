-- Create lecture_sessions table for actual teaching sessions
CREATE TABLE IF NOT EXISTS public.lecture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  transcript TEXT,
  summary TEXT,
  canvas_data JSONB,
  duration_minutes INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lecture_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lecture_sessions
CREATE POLICY "Teachers can view their own sessions"
  ON public.lecture_sessions FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create sessions"
  ON public.lecture_sessions FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own sessions"
  ON public.lecture_sessions FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own sessions"
  ON public.lecture_sessions FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_teacher_id ON public.lecture_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_lecture_id ON public.lecture_sessions(lecture_id);
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_group_id ON public.lecture_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_started_at ON public.lecture_sessions(started_at DESC);
