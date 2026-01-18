import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promotional_price: number | null;
  category: string;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

// Product interface compatible with the store frontend
export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  sizes: string[];
  colors: string[];
  brand: string;
  description: string;
  installments: number;
}

// Convert DB product to store product format
export function dbProductToStoreProduct(dbProduct: DbProduct): StoreProduct {
  const originalPrice = dbProduct.price;
  const price = dbProduct.promotional_price || dbProduct.price;
  const discount = dbProduct.promotional_price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    price,
    originalPrice,
    discount,
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5
    reviews: Math.floor(Math.random() * 200) + 50,
    image: dbProduct.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    sizes: getSizesForCategory(dbProduct.category),
    colors: ['Preto', 'Branco', 'Azul'],
    brand: 'Aura Store',
    description: dbProduct.description || 'Produto de alta qualidade',
    installments: 12,
  };
}

function getSizesForCategory(category: string): string[] {
  if (category === 'Acessórios') return ['Único'];
  if (category === 'Calçados') return ['38', '39', '40', '41', '42', '43'];
  return ['P', 'M', 'G', 'GG'];
}

export function useProducts() {
  return useQuery({
    queryKey: ['store-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbProductToStoreProduct);
    },
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['store-products', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true);
      
      // Map category URLs to DB categories
      const categoryMap: Record<string, string> = {
        masculino: 'Masculino',
        feminino: 'Feminino',
        acessorios: 'Acessórios',
        calcados: 'Calçados',
        infantil: 'Infantil',
      };

      const dbCategory = categoryMap[category.toLowerCase()];
      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbProductToStoreProduct);
    },
  });
}

export function useProductsWithOffers() {
  return useQuery({
    queryKey: ['store-products-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .not('promotional_price', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbProductToStoreProduct);
    },
  });
}
