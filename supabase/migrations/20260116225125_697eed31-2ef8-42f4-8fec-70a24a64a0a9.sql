-- Insert sample products
INSERT INTO public.products (name, description, price, promotional_price, category, stock, image_url, active) VALUES
('Camiseta Básica Premium Algodão Pima', 'Camiseta premium confeccionada em algodão pima peruano.', 129.90, 89.90, 'Masculino', 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', true),
('Calça Jeans Slim Fit Stretch', 'Calça jeans com elastano para maior conforto.', 259.90, 179.90, 'Masculino', 30, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', true),
('Moletom Oversized Urban Style', 'Moletom oversized com capuz.', 199.90, 149.90, 'Masculino', 25, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', true),
('Polo Classic Fit Piqué Cotton', 'Camisa polo clássica em malha piqué.', 169.90, 129.90, 'Masculino', 40, 'https://images.unsplash.com/photo-1625910513413-5fc4b95ae0f5?w=400&h=500&fit=crop', true),
('Jaqueta Corta-Vento Sport', 'Jaqueta corta-vento impermeável.', 299.90, 199.90, 'Masculino', 20, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop', true),
('Vestido Midi Floral Primavera', 'Vestido midi com estampa floral exclusiva.', 249.90, 159.90, 'Feminino', 35, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', true),
('Blazer Feminino Alfaiataria Premium', 'Blazer de alfaiataria impecável.', 399.90, 289.90, 'Feminino', 15, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop', true),
('Conjunto Fitness Power', 'Conjunto fitness com top e legging.', 279.90, 189.90, 'Feminino', 45, 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=500&fit=crop', true),
('Vestido Longo Festa', 'Vestido longo para ocasiões especiais.', 499.90, 349.90, 'Feminino', 10, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop', true),
('Legging Cintura Alta', 'Legging de alta compressão.', 149.90, 99.90, 'Feminino', 60, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop', true),
('Bolsa Tote Couro Sintético', 'Bolsa tote espaçosa em couro sintético.', 229.90, 159.90, 'Acessórios', 25, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', true),
('Óculos de Sol Aviador', 'Óculos aviador com proteção UV400.', 299.90, 199.90, 'Acessórios', 30, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop', true),
('Relógio Analógico Classic', 'Relógio analógico com pulseira em aço.', 349.90, 249.90, 'Acessórios', 20, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop', true),
('Mochila Urban Notebook', 'Mochila resistente com compartimento para notebook.', 269.90, 189.90, 'Acessórios', 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', true);

-- Insert sample banners
INSERT INTO public.banners (title, subtitle, button_text, button_link, image_url, active, display_order) VALUES
('OS MELHORES LOOKS COM OS MENORES PREÇOS', 'Ofertas imperdíveis para você', 'CONFIRA', '/categoria/ofertas', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=450&fit=crop', true, 0),
('NOVA COLEÇÃO VERÃO 2024', 'Tendências que você vai amar', 'COMPRAR', '/categoria/feminino', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=450&fit=crop', true, 1),
('MODA MASCULINA COM ATÉ 40% OFF', 'Estilo e economia em um só lugar', 'APROVEITAR', '/categoria/masculino', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&h=450&fit=crop', true, 2);

-- Insert sample orders for dashboard
INSERT INTO public.orders (customer_name, customer_email, total, status, items) VALUES
('João Silva', 'joao@email.com', 289.80, 'paid', '[{"id": "1", "name": "Camiseta Básica", "price": 89.90, "quantity": 2, "category": "Masculino"}]'),
('Maria Santos', 'maria@email.com', 449.80, 'shipped', '[{"id": "2", "name": "Vestido Midi Floral", "price": 159.90, "quantity": 1, "category": "Feminino"}, {"id": "3", "name": "Blazer Feminino", "price": 289.90, "quantity": 1, "category": "Feminino"}]'),
('Pedro Costa', 'pedro@email.com', 199.90, 'pending', '[{"id": "4", "name": "Óculos de Sol", "price": 199.90, "quantity": 1, "category": "Acessórios"}]'),
('Ana Lima', 'ana@email.com', 369.80, 'delivered', '[{"id": "5", "name": "Conjunto Fitness", "price": 189.90, "quantity": 1, "category": "Feminino"}, {"id": "6", "name": "Moletom Oversized", "price": 149.90, "quantity": 1, "category": "Masculino"}]'),
('Carlos Oliveira', 'carlos@email.com', 529.70, 'paid', '[{"id": "7", "name": "Jaqueta Corta-Vento", "price": 199.90, "quantity": 1, "category": "Masculino"}, {"id": "8", "name": "Calça Jeans", "price": 179.90, "quantity": 1, "category": "Masculino"}, {"id": "9", "name": "Legging", "price": 99.90, "quantity": 1, "category": "Feminino"}]');