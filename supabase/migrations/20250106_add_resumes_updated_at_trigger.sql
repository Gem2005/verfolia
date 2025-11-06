-- Add trigger to automatically update updated_at column for resumes table
-- This ensures that whenever a resume is updated, the updated_at timestamp is automatically refreshed

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on resumes table
CREATE TRIGGER trigger_update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resumes_updated_at();

-- Add comment for documentation
COMMENT ON FUNCTION update_resumes_updated_at() IS 'Automatically updates the updated_at timestamp when a resume is modified';
COMMENT ON TRIGGER trigger_update_resumes_updated_at ON public.resumes IS 'Updates updated_at timestamp on resume updates';
