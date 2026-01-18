import { useState, useEffect, useRef } from 'react';
import { X, Star, Truck, ShieldCheck, Minus, Plus, ZoomIn } from 'lucide-react';
import { StoreProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}
interface ProductModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}
export function ProductModal({
  product,
  onClose
}: ProductModalProps) {
  const {
    addToCart
  } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50
  });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch additional product images
  useEffect(() => {
    if (product) {
      const fetchImages = async () => {
        const {
          data
        } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order', {
          ascending: true
        });

        // Combine main image with additional images
        const allImages = [product.image];
        if (data && data.length > 0) {
          allImages.push(...data.map((img: ProductImage) => img.image_url));
        }
        setProductImages(allImages);
        setSelectedImageIndex(0);
      };
      fetchImages();
    }
  }, [product]);
  if (!product) return null;
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Selecione tamanho e cor.');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    onClose();
  };
  const priceFormatted = product.price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2
  });
  const originalPriceFormatted = product.originalPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2
  });
  const installmentValue = (product.price / 12).toLocaleString('pt-BR', {
    minimumFractionDigits: 2
  });
  const currentImage = productImages[selectedImageIndex] || product.image;
  return <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-muted transition-colors">
          <X size={20} />
        </button>

        {/* Image Gallery */}
        <div className="md:w-1/2 h-56 md:h-auto relative bg-white flex">
          {/* Thumbnails */}
          {productImages.length > 1 && <div className="w-16 md:w-20 flex flex-col gap-2 p-2 overflow-y-auto bg-teal-50">
              {productImages.map((img, index) => <button key={index} onClick={() => setSelectedImageIndex(index)} className={`aspect-square border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all ${selectedImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                  <img src={img} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover" />
                </button>)}
            </div>}
          
          {/* Main Image with Zoom */}
          <div ref={imageContainerRef} className="flex-1 relative overflow-hidden cursor-zoom-in" onMouseEnter={() => setIsZooming(true)} onMouseLeave={() => setIsZooming(false)} onMouseMove={e => {
          if (!imageContainerRef.current) return;
          const rect = imageContainerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          setZoomPosition({
            x,
            y
          });
        }}>
            {product.discount > 0 && <span className="badge-discount absolute top-3 left-3 z-10">
                {product.discount}%
              </span>}
            
            {/* Zoom indicator */}
            <div className="absolute bottom-3 right-3 z-10 bg-background/80 rounded-full p-2 opacity-60">
              <ZoomIn size={16} />
            </div>
            
            {/* Normal Image */}
            <img src={currentImage} alt={product.name} className={`w-full h-full object-contain p-8 transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`} />
            
            {/* Zoomed Image */}
            {isZooming && <div className="absolute inset-0 bg-gray-50" style={{
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }} />}
          </div>
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-5 md:p-6 overflow-y-auto">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.brand}
          </span>
          <h2 className="text-lg md:text-xl font-bold mt-1 mb-3">{product.name}</h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-yellow-star text-yellow-star' : 'text-muted'} />)}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="rounded-lg p-4 mb-4 bg-teal-50">
            {product.originalPrice > product.price && <span className="text-sm text-muted-foreground line-through">
                R$ {originalPriceFormatted}
              </span>}
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">R$ {priceFormatted}</p>
              <span className="text-sm text-pix-green font-medium">no Pix</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ou 12x de <span className="font-semibold text-foreground">R$ {installmentValue}</span> sem juros
            </p>
          </div>

          {/* Color */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Cor: {selectedColor || 'Selecione'}</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 border rounded text-xs transition-colors ${selectedColor === color ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}>
                  {color}
                </button>)}
            </div>
          </div>

          {/* Size */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Tamanho: {selectedSize || 'Selecione'}</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`w-10 h-10 border rounded font-medium text-sm transition-colors ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}>
                  {size}
                </button>)}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Quantidade</h3>
            <div className="flex items-center border rounded w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted transition-colors">
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Shipping */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Truck size={16} className="text-primary" />
              Calcular Frete
            </h3>
            <div className="flex gap-2">
              <input type="text" placeholder="CEP" value={cep} onChange={e => setCep(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary" maxLength={9} />
              <button className="px-4 py-2 border rounded text-sm hover:bg-muted transition-colors">
                OK
              </button>
            </div>
            {cep.length >= 8 && <p className="text-xs text-pix-green mt-2">✓ Frete grátis em até 5 dias</p>}
          </div>

          {/* Add to Cart */}
          <button onClick={handleAddToCart} className="btn-primary w-full py-3 mb-3">
            ADICIONAR AO CARRINHO
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-primary" />
              Compra segura
            </span>
            <span className="flex items-center gap-1">
              <Truck size={14} className="text-primary" />
              Troca fácil
            </span>
          </div>
        </div>
      </div>
    </>;
}