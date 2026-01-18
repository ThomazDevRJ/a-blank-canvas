import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductModal } from '@/components/ProductModal';
import { ProductCard } from '@/components/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { useProductsByCategory, StoreProduct } from '@/hooks/useProducts';
import { getProductsByCategory, Product as MockProduct, priceRanges } from '@/data/products';

const categoryInfo: Record<string, { title: string; description: string; banner: string }> = {
  masculino: {
    title: "Moda Masculina",
    description: "Estilo e conforto para o homem moderno",
    banner: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&h=300&fit=crop"
  },
  feminino: {
    title: "Moda Feminina",
    description: "Elegância e sofisticação para todas as ocasiões",
    banner: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=300&fit=crop"
  },
  acessorios: {
    title: "Acessórios",
    description: "Detalhes que fazem toda a diferença",
    banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=300&fit=crop"
  },
  ofertas: {
    title: "Super Ofertas",
    description: "Os melhores descontos da loja",
    banner: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=300&fit=crop"
  }
};

function convertMockProduct(p: MockProduct): StoreProduct {
  return {
    ...p,
    id: String(p.id),
  };
}

function CategoryPageContent() {
  const { category } = useParams<{ category: string }>();
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [openSections, setOpenSections] = useState({ brand: true, price: true });

  const categoryKey = category?.toLowerCase() || 'masculino';
  const info = categoryInfo[categoryKey] || categoryInfo.masculino;
  
  const categoryMap: Record<string, string> = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    acessorios: 'Acessórios',
    ofertas: 'Ofertas'
  };

  const { data: dbProducts, isLoading } = useProductsByCategory(categoryKey);

  // Use DB products if available, otherwise fallback to mock data
  const hasDbProducts = dbProducts && dbProducts.length > 0;
  
  let products: StoreProduct[] = hasDbProducts
    ? dbProducts
    : getProductsByCategory(categoryMap[categoryKey] || 'Masculino').map(convertMockProduct);

  // Apply filters
  if (selectedBrands.length > 0) {
    products = products.filter(p => selectedBrands.includes(p.brand));
  }
  if (selectedPriceRange) {
    products = products.filter(p => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max);
  }

  // Sort products
  products = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'discount': return b.discount - a.discount;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
  };

  const availableBrands = [...new Set(products.map(p => p.brand))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <div className="relative h-32 md:h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${info.banner})` }}
          >
            <div className="absolute inset-0 bg-navy/80" />
          </div>
          <div className="container relative h-full flex flex-col justify-center">
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">{info.title}</span>
            </nav>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{info.title}</h1>
            <p className="text-white/80 text-sm md:text-base">{info.description}</p>
          </div>
        </div>

        <div className="container py-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded hover:bg-muted transition-colors"
              >
                <Filter size={18} />
                Filtros
              </button>
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Carregando...' : `${products.length} produtos encontrados`}
              </span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded bg-card text-sm focus:outline-none focus:border-primary"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="discount">Maior Desconto</option>
              <option value="rating">Melhor Avaliação</option>
            </select>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-card rounded-lg p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filtros</h3>
                  {(selectedBrands.length > 0 || selectedPriceRange) && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                      Limpar
                    </button>
                  )}
                </div>

                {/* Brands */}
                <div className="mb-4">
                  <button
                    onClick={() => setOpenSections(s => ({ ...s, brand: !s.brand }))}
                    className="flex items-center justify-between w-full text-sm font-medium mb-2"
                  >
                    Marcas
                    {openSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.brand && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          {brand.replace('Aura ', '')}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <button
                    onClick={() => setOpenSections(s => ({ ...s, price: !s.price }))}
                    className="flex items-center justify-between w-full text-sm font-medium mb-2"
                  >
                    Preço
                    {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.price && (
                    <div className="space-y-1">
                    {priceRanges.map(range => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(
                          selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max ? null : range
                        )}
                          className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                            selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
                  <button onClick={clearFilters} className="text-primary hover:underline">
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)} />
            <aside className="fixed top-0 left-0 h-full w-72 bg-card z-50 lg:hidden animate-slide-in-right overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filtros</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} />
                  </button>
                </div>

                {(selectedBrands.length > 0 || selectedPriceRange) && (
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline mb-4 block">
                    Limpar filtros
                  </button>
                )}

                {/* Brands */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Marcas</p>
                  <div className="space-y-1">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded"
                        />
                        {brand.replace('Aura ', '')}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-sm font-medium mb-2">Preço</p>
                  <div className="space-y-1">
                    {priceRanges.map(range => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(
                          selectedPriceRange?.min === range.min ? null : range
                        )}
                        className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                          selectedPriceRange?.min === range.min
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <CartProvider>
      <CategoryPageContent />
    </CartProvider>
  );
}
