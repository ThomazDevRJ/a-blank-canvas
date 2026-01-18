import { StoreProduct } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';

interface ProductSectionProps {
  title: string;
  emoji?: string;
  products: StoreProduct[];
  onViewDetails: (product: StoreProduct) => void;
}

export function ProductSection({ title, emoji, products, onViewDetails }: ProductSectionProps) {
  return (
    <section className="py-8">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold inline-flex items-center gap-2">
            {title}
            {emoji && <span>{emoji}</span>}
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-2" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
