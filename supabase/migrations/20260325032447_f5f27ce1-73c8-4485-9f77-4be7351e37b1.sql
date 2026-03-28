
-- Create storage bucket for site content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-content', 'site-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload to site-content bucket
CREATE POLICY "Admins can upload site content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-content'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update site content images
CREATE POLICY "Admins can update site content images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-content'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete site content images
CREATE POLICY "Admins can delete site content images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-content'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow anyone to view site content images (public)
CREATE POLICY "Anyone can view site content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-content');
