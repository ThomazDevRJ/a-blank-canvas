import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { StoreSeal } from '@/hooks/useStoreSettings';

interface StoreFormData {
  store_name: string;
  store_logo: string;
  store_description: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  store_cnpj: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
}

interface FooterPreviewProps {
  storeForm: StoreFormData;
  seals: StoreSeal[];
  paymentMethods: StoreSeal[];
}

export function FooterPreview({ storeForm, seals, paymentMethods }: FooterPreviewProps) {
  return (
    <div className="rounded-lg overflow-hidden border shadow-sm scale-[0.85] origin-top">
      <footer className="bg-navy text-white">
        {/* Main Footer */}
        <div className="py-6">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* About */}
              <div>
                {storeForm.store_logo ? (
                  <div className="mb-3">
                    <img src={storeForm.store_logo} alt={storeForm.store_name || 'Logo'} className="h-8 object-contain" />
                  </div>
                ) : (
                  <h2 className="text-lg font-bold mb-3">
                    {storeForm.store_name ? (
                      storeForm.store_name
                    ) : (
                      <><span className="text-primary">Aura</span>Outlet</>
                    )}
                  </h2>
                )}
                <p className="text-white/60 text-xs leading-relaxed mb-3 line-clamp-3">
                  {storeForm.store_description || 'As mais ofertas e tecnologias sempre em nossa loja. Atendemos em todo o brasil, disponibilizamos produtos de todas as grandes marcas do mercado, pelos melhores preços.'}
                </p>
                <div className="space-y-1.5 text-xs text-white/60">
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} className="text-primary" />
                    {storeForm.store_phone || '(51) 0000-0000'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail size={12} className="text-primary" />
                    {storeForm.store_email || 'contato@auraoutlet.com'}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  {storeForm.facebook_url ? (
                    <span className="w-6 h-6 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors cursor-pointer">
                      <Facebook size={12} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-white/10 rounded flex items-center justify-center opacity-50">
                      <Facebook size={12} />
                    </span>
                  )}
                  {storeForm.instagram_url ? (
                    <span className="w-6 h-6 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors cursor-pointer">
                      <Instagram size={12} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-white/10 rounded flex items-center justify-center opacity-50">
                      <Instagram size={12} />
                    </span>
                  )}
                  {storeForm.youtube_url ? (
                    <span className="w-6 h-6 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors cursor-pointer">
                      <Youtube size={12} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-white/10 rounded flex items-center justify-center opacity-50">
                      <Youtube size={12} />
                    </span>
                  )}
                  {storeForm.twitter_url ? (
                    <span className="w-6 h-6 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors cursor-pointer">
                      <Twitter size={12} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-white/10 rounded flex items-center justify-center opacity-50">
                      <Twitter size={12} />
                    </span>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Categorias</h3>
                <ul className="space-y-1.5 text-xs text-white/60">
                  <li>Masculino</li>
                  <li>Feminino</li>
                  <li>Acessórios</li>
                  <li>Ofertas</li>
                </ul>
              </div>

              {/* Institutional */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Institucional</h3>
                <ul className="space-y-1.5 text-xs text-white/60">
                  <li>Quem Somos</li>
                  <li>Compras Seguras</li>
                  <li>Entregas</li>
                  <li>Política de Privacidade</li>
                </ul>
              </div>

              {/* Map */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Nossa Localização</h3>
                <div className="rounded-lg overflow-hidden h-20 bg-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=150&fit=crop"
                    alt="Mapa"
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
                <p className="text-xs text-white/60 mt-1.5 flex items-start gap-1">
                  <MapPin size={10} className="text-primary mt-0.5 flex-shrink-0" />
                  {storeForm.store_address || 'Av. Paulista, 1000 - São Paulo, SP'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Seals */}
        <div className="border-t border-white/10 py-4">
          <div className="container">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Trust Seals */}
              {seals.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40">Selos:</span>
                  {seals.map((seal) => (
                    <div key={seal.id} className="bg-white/10 px-1.5 py-0.5 rounded">
                      <img src={seal.image_url} alt={seal.name} className="h-4 w-auto object-contain" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/40">Selos:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Google</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">PROCON</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">RA 1000</span>
                </div>
              )}
              
              {/* Payment Methods */}
              {paymentMethods.length > 0 ? (
                <div className="flex items-center gap-2">
                  {paymentMethods.map((payment) => (
                    <div key={payment.id} className="bg-white/10 px-1.5 py-0.5 rounded">
                      <img src={payment.image_url} alt={payment.name} className="h-3.5 w-auto object-contain" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Visa</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Master</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Pix</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Boleto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-navy-dark py-2">
          <div className="container text-center text-[10px] text-white/40">
            <p>© 2024 - CNPJ: {storeForm.store_cnpj || '00.000.000/0001-00'}</p>
            <p className="mt-0.5">Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
