import { Search, User, ShoppingCart, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { AuthModal } from './AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { data: storeSettings } = useStoreSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const categories = [
    { name: 'Masculino', path: '/categoria/masculino', hasDropdown: true },
    { name: 'Feminino', path: '/categoria/feminino', hasDropdown: true },
    { name: 'Acessórios', path: '/categoria/acessorios', hasDropdown: true },
    { name: 'Ofertas', path: '/categoria/ofertas', hasDropdown: false, highlight: true },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <>
      <header className="bg-navy sticky top-0 z-40">
        {/* Main Header */}
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              {storeSettings?.store_logo ? (
                <img src={storeSettings.store_logo} alt={storeSettings.store_name || 'Logo'} className="h-8 md:h-10 object-contain" />
              ) : (
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {storeSettings?.store_name ? (
                    storeSettings.store_name
                  ) : (
                    <><span className="text-primary">Aura</span>Outlet</>
                  )}
                </h1>
              )}
            </Link>

            {/* Categories - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    cat.highlight 
                      ? 'text-primary hover:text-teal-light' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {cat.name}
                  {cat.hasDropdown && <ChevronDown size={14} />}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="flex w-full bg-white rounded overflow-hidden">
                <input
                  type="text"
                  placeholder="buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm text-foreground focus:outline-none"
                />
                <button className="px-4 bg-white text-muted-foreground hover:text-primary transition-colors" aria-label="Buscar">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden md:flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm">
                    <User size={20} />
                    <span className="hidden lg:inline">{userName}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden md:flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
                >
                  <User size={20} />
                  <span className="hidden lg:inline">Minha Conta</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="flex w-full bg-white rounded overflow-hidden">
              <input
                type="text"
                placeholder="buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-foreground focus:outline-none"
              />
              <button className="px-3 text-muted-foreground" aria-label="Buscar">
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden bg-navy-dark border-t border-white/10">
            <div className="container py-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    cat.highlight ? 'text-primary' : 'text-white/90'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block py-2 text-sm font-medium text-red-400"
                >
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="block py-2 text-sm font-medium text-white/90"
                >
                  Minha Conta
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
