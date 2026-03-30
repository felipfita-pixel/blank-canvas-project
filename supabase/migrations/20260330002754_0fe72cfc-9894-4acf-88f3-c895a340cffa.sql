-- Restrict property image delete/update to admins only
DROP POLICY IF EXISTS "Authenticated can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'property-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can update property images" ON storage.objects;
CREATE POLICY "Admins can update property images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'property-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Also restrict upload to admins
DROP POLICY IF EXISTS "Authenticated can upload property images" ON storage.objects;
CREATE POLICY "Admins can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND has_role(auth.uid(), 'admin'::app_role));