import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StoreProduct } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: StoreProduct, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: (customerName: string, customerEmail: string) => Promise<boolean>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: StoreProduct, size: string, color: string) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === product.id && item.size === size && item.color === color
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { product, quantity: 1, size, color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const checkout = async (customerName: string, customerEmail: string): Promise<boolean> => {
    if (items.length === 0) return false;

    setIsCheckingOut(true);

    try {
      // Get current user (optional - can checkout as guest)
      const { data: { user } } = await supabase.auth.getUser();

      const orderItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        category: item.product.category,
      }));

      const { error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: customerName,
        customer_email: customerEmail,
        total: totalPrice,
        status: 'pending',
        items: orderItems,
      });

      if (error) throw error;

      toast({
        title: 'Pedido realizado!',
        description: 'Você receberá um email com os detalhes.',
      });

      clearCart();
      setIsCartOpen(false);
      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro no pedido',
        description: 'Não foi possível finalizar o pedido. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        checkout,
        isCheckingOut,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
