export function PartnersBar() {
  const partners = [
    { name: 'Authorized', subtitle: 'RESELLER' },
    { name: 'PREMIUM', subtitle: 'PARTNER' },
    { name: 'Certified', subtitle: 'QUALITY' },
  ];

  return (
    <section className="py-6 border-t border-b border-border bg-white">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="text-center">
                <span className="text-lg font-bold text-navy">{partner.name}</span>
                <span className="block text-xs text-primary font-semibold tracking-wider">{partner.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
