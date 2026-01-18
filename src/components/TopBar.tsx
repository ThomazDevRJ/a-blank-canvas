import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground py-1.5 text-xs">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Toda loja em até 12x sem juros com taxa zero nas suas compras</span>
          <a href="#" className="underline hover:no-underline font-medium">@AuraOutlet</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
            <Facebook size={14} />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
            <Instagram size={14} />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Youtube">
            <Youtube size={14} />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity" aria-label="TikTok">
            <Twitter size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
