import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { useStoreSettings, useStoreSeals } from '@/hooks/useStoreSettings';

export function Footer() {
  const { data: settings } = useStoreSettings();
  const { data: seals = [] } = useStoreSeals('seal');
  const { data: paymentMethods = [] } = useStoreSeals('payment');

  return (
    <footer className="bg-navy text-white">
      {/* Main Footer */}
      <div className="py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              {settings?.store_logo ? (
                <div className="mb-4">
                  <img src={settings.store_logo} alt={settings.store_name || 'Logo'} className="h-10 object-contain" />
                </div>
              ) : (
                <h2 className="text-xl font-bold mb-4">
                  {settings?.store_name ? (
                    settings.store_name
                  ) : (
                    <><span className="text-primary">Aura</span>Outlet</>
                  )}
                </h2>
              )}
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                {settings?.store_description || 'As mais ofertas e tecnologias sempre em nossa loja. Atendemos em todo o brasil, disponibilizamos produtos de todas as grandes marcas do mercado, pelos melhores preços.'}
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  {settings?.store_phone || '(51) 0000-0000'}
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-primary" />
                  {settings?.store_email || 'contato@auraoutlet.com'}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                {settings?.facebook_url ? (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Facebook size={16} />
                  </a>
                ) : (
                  <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Facebook size={16} />
                  </a>
                )}
                {settings?.instagram_url ? (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Instagram size={16} />
                  </a>
                ) : (
                  <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Instagram size={16} />
                  </a>
                )}
                {settings?.youtube_url ? (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Youtube size={16} />
                  </a>
                ) : (
                  <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Youtube size={16} />
                  </a>
                )}
                {settings?.twitter_url ? (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Twitter size={16} />
                  </a>
                ) : (
                  <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                    <Twitter size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">Categorias</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link to="/categoria/masculino" className="hover:text-primary transition-colors">Masculino</Link></li>
                <li><Link to="/categoria/feminino" className="hover:text-primary transition-colors">Feminino</Link></li>
                <li><Link to="/categoria/acessorios" className="hover:text-primary transition-colors">Acessórios</Link></li>
                <li><Link to="/categoria/ofertas" className="hover:text-primary transition-colors">Ofertas</Link></li>
              </ul>
            </div>

            {/* Institutional */}
            <div>
              <h3 className="font-semibold mb-4">Institucional</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-primary transition-colors">Quem Somos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Compras Seguras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Entregas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Trocas e Devoluções</a></li>
              </ul>
            </div>

            {/* Map */}
            <div>
              <h3 className="font-semibold mb-4">Nossa Localização</h3>
              <div className="rounded-lg overflow-hidden h-32 bg-white/10">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=150&fit=crop"
                  alt="Mapa"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <p className="text-xs text-white/60 mt-2 flex items-start gap-1">
                <MapPin size={12} className="text-primary mt-0.5 flex-shrink-0" />
                {settings?.store_address || 'Av. Paulista, 1000 - São Paulo, SP'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Seals */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Trust Seals */}
            {seals.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">Selos:</span>
                {seals.map((seal) => (
                  <div key={seal.id} className="bg-white/10 px-2 py-1 rounded">
                    <img src={seal.image_url} alt={seal.name} className="h-6 w-auto object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Selos:</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Google</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">PROCON</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">RA 1000</span>
              </div>
            )}
            
            {/* Payment Methods */}
            {paymentMethods.length > 0 ? (
              <div className="flex items-center gap-3">
                {paymentMethods.map((payment) => (
                  <div key={payment.id} className="bg-white/10 px-2 py-1 rounded">
                    <img src={payment.image_url} alt={payment.name} className="h-5 w-auto object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Visa</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Master</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Elo</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Pix</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs">Boleto</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-navy-dark py-4">
        <div className="container text-center text-xs text-white/40">
          <p>© 2024 Aura Outlet - CNPJ: {settings?.store_cnpj || '00.000.000/0001-00'}</p>
          <p className="mt-1">Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
