-- Create lectures table for lecture templates/plans
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lectures
CREATE POLICY "Teachers can view their own lectures"
  ON public.lectures FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create lectures"
  ON public.lectures FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own lectures"
  ON public.lectures FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own lectures"
  ON public.lectures FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lectures_teacher_id ON public.lectures(teacher_id);
