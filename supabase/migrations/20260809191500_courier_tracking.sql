-- Migration to support real-world courier and live driver GPS tracking

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name TEXT DEFAULT 'Kasun Perera';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_phone TEXT DEFAULT '+94740489343';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_vehicle TEXT DEFAULT 'Honda Click (WP BI-8291)';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_lat DOUBLE PRECISION DEFAULT 6.9271;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_lng DOUBLE PRECISION DEFAULT 79.8612;

-- Enable Realtime publication for live tracking on orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
