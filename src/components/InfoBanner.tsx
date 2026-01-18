import { Check } from 'lucide-react';

export function InfoBanner() {
  return (
    <section className="bg-gradient-to-r from-navy via-navy-dark to-navy py-10 my-8">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h2 className="text-primary text-lg font-bold mb-2">
              POR QUE COMPRAR NA AURA OUTLET?
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-4 leading-tight">
              QUALIDADE PREMIUM COM PREÇOS QUE CABEM NO BOLSO
            </p>
            <p className="text-white/70 text-sm mb-6">
              Trabalhamos com as melhores marcas e tecidos, garantindo peças de alta 
              qualidade com durabilidade incomparável.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-primary w-4 h-4" />
                <span>TECIDOS DE ALTA QUALIDADE</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-primary w-4 h-4" />
                <span>ENTREGA RÁPIDA PARA TODO BRASIL</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-primary w-4 h-4" />
                <span>TROCA FÁCIL EM ATÉ 30 DIAS</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-primary w-4 h-4" />
                <span>PARCELAMENTO EM ATÉ 12X SEM JUROS</span>
              </li>
            </ul>
          </div>
          
          <div className="hidden md:flex justify-end">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 max-w-xs">
              <p className="text-primary text-sm font-semibold mb-2">VISTA TODA A COLEÇÃO</p>
              <p className="text-white text-2xl font-bold mb-4">AURA OUTLET</p>
              <button className="btn-primary text-sm w-full">
                CONFERIR
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
