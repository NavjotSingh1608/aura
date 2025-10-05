-- Create groups table for student groups/classes
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Teachers can view their own groups"
  ON public.groups FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON public.groups(teacher_id);
