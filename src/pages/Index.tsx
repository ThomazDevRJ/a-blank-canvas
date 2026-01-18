import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductSection } from '@/components/ProductSection';
import { InfoBanner } from '@/components/InfoBanner';
import { PromoBanners } from '@/components/PromoBanners';
import { PartnersBar } from '@/components/PartnersBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductModal } from '@/components/ProductModal';
import { CartProvider } from '@/context/CartContext';
import { useProducts, useProductsWithOffers, StoreProduct } from '@/hooks/useProducts';
import { ChevronRight, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

// Fallback products when DB is empty
import { getProductsByCategory, Product as MockProduct } from '@/data/products';

function convertMockProduct(p: MockProduct): StoreProduct {
  return {
    ...p,
    id: String(p.id),
  };
}

function IndexContent() {
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  
  const { data: dbProducts, isLoading } = useProducts();
  const { data: offersProducts } = useProductsWithOffers();

  // Use DB products if available, otherwise fallback to mock data
  const hasDbProducts = dbProducts && dbProducts.length > 0;
  
  const allProducts = hasDbProducts 
    ? dbProducts 
    : getProductsByCategory('Todos').map(convertMockProduct);
  
  const masculino = hasDbProducts
    ? dbProducts.filter(p => p.category === 'Masculino').slice(0, 4)
    : getProductsByCategory('Masculino').slice(0, 4).map(convertMockProduct);
  
  const feminino = hasDbProducts
    ? dbProducts.filter(p => p.category === 'Feminino').slice(0, 4)
    : getProductsByCategory('Feminino').slice(0, 4).map(convertMockProduct);
  
  const ofertas = offersProducts && offersProducts.length > 0
    ? offersProducts.slice(0, 4)
    : getProductsByCategory('Ofertas').slice(0, 4).map(convertMockProduct);
  
  const maisVendidos = allProducts.slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />
      
      <main className="flex-1">
        <HeroCarousel />
        
        <ProductSection
          title="Mais vendidos"
          products={maisVendidos}
          onViewDetails={setSelectedProduct}
        />

        <InfoBanner />

        {/* Masculino Section with Link */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold inline-flex items-center gap-2">
                  Moda Masculina 👔
                </h2>
                <div className="w-16 h-0.5 bg-primary mx-auto mt-2" />
              </div>
              <Link
                to="/categoria/masculino"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver todos <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {masculino.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Feminino Section with Link */}
        <section className="py-8 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold inline-flex items-center gap-2">
                  Moda Feminina 👗
                </h2>
                <div className="w-16 h-0.5 bg-primary mx-auto mt-2" />
              </div>
              <Link
                to="/categoria/feminino"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver todos <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {feminino.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        </section>

        <ProductSection
          title="Super Ofertas"
          emoji="🔥"
          products={ofertas}
          onViewDetails={setSelectedProduct}
        />

        <PromoBanners />
        <PartnersBar />
      </main>

      <Footer />
      <CartDrawer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
