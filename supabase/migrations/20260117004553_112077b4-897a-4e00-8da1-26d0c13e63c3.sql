-- Create store settings table
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view store settings" 
ON public.store_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update store settings" 
ON public.store_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert store settings" 
ON public.store_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete store settings" 
ON public.store_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create store seals/badges table for images
CREATE TABLE public.store_seals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'seal', -- 'seal' or 'payment'
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_seals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active store seals" 
ON public.store_seals 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can view all store seals" 
ON public.store_seals 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert store seals" 
ON public.store_seals 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update store seals" 
ON public.store_seals 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete store seals" 
ON public.store_seals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.store_settings (key, value) VALUES
('store_description', 'As mais ofertas e tecnologias sempre em nossa loja. Atendemos em todo o brasil, disponibilizamos produtos de todas as grandes marcas do mercado, pelos melhores preços.'),
('store_phone', '(51) 0000-0000'),
('store_email', 'contato@auraoutlet.com'),
('store_address', 'Av. Paulista, 1000 - São Paulo, SP'),
('store_cnpj', '00.000.000/0001-00'),
('facebook_url', ''),
('instagram_url', ''),
('youtube_url', ''),
('twitter_url', '');

-- Create storage bucket for seals
INSERT INTO storage.buckets (id, name, public) 
VALUES ('seals', 'seals', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for seals bucket
CREATE POLICY "Anyone can view seal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'seals');

CREATE POLICY "Admins can upload seal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'seals' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update seal images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'seals' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete seal images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'seals' AND has_role(auth.uid(), 'admin'::app_role));