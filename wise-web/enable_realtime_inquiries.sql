-- Enable Realtime for inquiries table

-- Turn on full replica identity so Old and New rows are broadcasted
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;

-- Add the table to the Supabase Realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.inquiries;
COMMIT;
