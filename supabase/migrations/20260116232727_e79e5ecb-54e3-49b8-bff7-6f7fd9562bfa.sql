INSERT INTO public.user_roles (user_id, role)
VALUES ('0a9aaabd-aeb9-4478-8f3d-6bb62870c8ae', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;