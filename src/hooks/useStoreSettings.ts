import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSetting {
  id: string;
  key: string;
  value: string | null;
}

export interface StoreSeal {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
  type: 'seal' | 'payment';
  active: boolean;
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert array to object for easier access
      const settings: Record<string, string> = {};
      (data || []).forEach((item: StoreSetting) => {
        settings[item.key] = item.value || '';
      });
      
      return settings;
    },
  });
}

export function useStoreSeals(type?: 'seal' | 'payment') {
  return useQuery({
    queryKey: ['store-seals', type],
    queryFn: async () => {
      let query = supabase
        .from('store_seals')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as StoreSeal[];
    },
  });
}

export function useUpdateStoreSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });
}

export function useCreateStoreSeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (seal: Omit<StoreSeal, 'id'>) => {
      const { data, error } = await supabase
        .from('store_seals')
        .insert(seal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-seals'] });
    },
  });
}

export function useDeleteStoreSeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('store_seals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-seals'] });
    },
  });
}

export function useReorderStoreSeals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (seals: { id: string; display_order: number }[]) => {
      for (const seal of seals) {
        const { error } = await supabase
          .from('store_seals')
          .update({ display_order: seal.display_order })
          .eq('id', seal.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-seals'] });
    },
  });
}
