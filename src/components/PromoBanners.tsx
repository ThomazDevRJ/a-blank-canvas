export function PromoBanners() {
  return (
    <section className="py-6">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-lg bg-navy h-40 md:h-48">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=300&fit=crop)' }}
            />
            <div className="relative p-6 h-full flex flex-col justify-center">
              <div className="text-white">
                <p className="text-primary text-xs font-bold mb-1">AURA OUTLET</p>
                <p className="text-sm font-bold leading-tight mb-1">
                  FOI ELEITA A MELHOR
                </p>
                <p className="text-sm font-bold leading-tight mb-1">
                  LOJA DE <span className="text-primary">ROUPAS ONLINE</span>
                </p>
                <p className="text-sm font-bold leading-tight">
                  DO <span className="text-primary">BRASIL</span> EM 2024
                </p>
              </div>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-100 to-amber-50 h-40 md:h-48">
            <div 
              className="absolute right-0 top-0 h-full w-1/2 bg-contain bg-right bg-no-repeat opacity-80"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop)' }}
            />
            <div className="relative p-6 h-full flex flex-col justify-center">
              <div>
                <p className="text-navy text-2xl font-bold mb-2">ESTILO</p>
                <p className="text-navy text-2xl font-bold mb-3">PREMIUM</p>
                <p className="text-xs text-navy/70 mb-2">CONFORTO E QUALIDADE</p>
                <button className="btn-primary text-xs px-4 py-1.5">
                  CONFIRA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
