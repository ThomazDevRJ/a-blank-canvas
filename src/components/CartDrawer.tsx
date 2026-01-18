import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    clearCart,
    checkout,
    isCheckingOut 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      return;
    }
    const success = await checkout(customerName, customerEmail);
    if (success) {
      setShowCheckout(false);
      setCustomerName('');
      setCustomerEmail('');
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-navy text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Meu Carrinho
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-muted mb-4" />
              <p className="font-medium mb-2">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione produtos para continuar
              </p>
              <button onClick={() => setIsCartOpen(false)} className="btn-primary text-sm">
                Continuar Comprando
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium line-clamp-2">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.size} • {item.color}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-muted transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-muted transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-primary">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ou 12x de R$ {(totalPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
            </p>
            <button 
              className="btn-primary w-full py-3"
              onClick={() => setShowCheckout(true)}
            >
              Finalizar Compra
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </aside>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isCheckingOut || !customerName.trim() || !customerEmail.trim()}
              >
                {isCheckingOut && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar Pedido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
