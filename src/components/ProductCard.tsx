import { Star } from 'lucide-react';
import { StoreProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: StoreProduct;
  onViewDetails: (product: StoreProduct) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]);
  };

  const priceFormatted = product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const originalPriceFormatted = product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const installmentValue = (product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <article
      className="card-product cursor-pointer group"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="badge-discount absolute top-2 left-2 z-10">
            {product.discount}%
          </span>
        )}
        
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-white p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <div className="p-3 bg-white">
        {/* Title */}
        <h3 className="text-xs text-foreground line-clamp-2 min-h-[2rem] leading-tight mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={10}
              className={i < Math.floor(product.rating) ? 'fill-yellow-star text-yellow-star' : 'text-muted'}
            />
          ))}
        </div>

        {/* Original Price */}
        {product.originalPrice > product.price && (
          <p className="text-xs text-muted-foreground line-through">
            R$ {originalPriceFormatted}
          </p>
        )}

        {/* Current Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-primary">
            R$ {priceFormatted}
          </span>
          <span className="text-xs text-pix-green font-medium">no Pix</span>
        </div>

        {/* Installments */}
        <p className="text-xs text-muted-foreground mt-1">
          12x R$ {installmentValue} sem juros
        </p>
      </div>
    </article>
  );
}
