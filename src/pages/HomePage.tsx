import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home, Layers, Square, Thermometer, UtensilsCrossed, Droplets,
  CheckCircle, Shield, Star, Phone, ArrowRight, Users
} from 'lucide-react';

const services = [
  {
    id: 'roofing',
    title: 'Roofing',
    description: 'Roof repair, replacement & new installation from trusted local roofers.',
    icon: <Home className="h-7 w-7" />,
    path: '/roofing',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'Heating & cooling repair, installation, and maintenance services.',
    icon: <Thermometer className="h-7 w-7" />,
    path: '/hvac',
  },
  {
    id: 'bath',
    title: 'Bath Remodel',
    description: 'Bathroom renovations, tub-to-shower conversions & walk-in tubs.',
    icon: <Layers className="h-7 w-7" />,
    path: '/bath',
  },
  {
    id: 'windows',
    title: 'Windows',
    description: 'Window replacement & installation with energy-efficient options.',
    icon: <Square className="h-7 w-7" />,
    path: '/windows',
  },
  {
    id: 'kitchen',
    title: 'Kitchen Remodel',
    description: 'Full and partial kitchen renovations from local specialists.',
    icon: <UtensilsCrossed className="h-7 w-7" />,
    path: '/kitchen',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Plumbing repairs, drain cleaning, water heaters & emergency service.',
    icon: <Droplets className="h-7 w-7" />,
    path: '/plumbing',
  },
];

const whyFamilyOwned = [
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Their Name Is on the Line',
    description: 'Family businesses stake their reputation on every job. Their name is their brand.',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Higher Quality Work',
    description: 'Honest craftsmanship passed down through generations. No corner-cutting.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Fair, Honest Pricing',
    description: 'Lower overhead means better value. You pay for quality work — nothing extra.',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'They Actually Care',
    description: 'You\'re a neighbor, not a ticket number. Relationships, not invoices.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-black/[0.06]">
        <div className="container mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img
              src="/FOC_less_logo.svg"
              alt="Family Owned Contractors"
              className="h-9 sm:h-11 w-auto"
            />
          </a>
          <Button
            size="sm"
            onClick={() => navigate('/home-services')}
            className="font-bold shadow-button rounded-lg text-xs sm:text-sm"
          >
            Get Free Quotes <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center">
        {/* Gradient mesh */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 65% 15%, rgba(1,100,174,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 15% 85%, rgba(1,63,132,0.3) 0%, transparent 50%),
            radial-gradient(ellipse 35% 35% at 85% 75%, rgba(124,191,68,0.07) 0%, transparent 50%)
          `,
        }} />

        <div className="container mx-auto px-4 py-14 sm:py-20 lg:py-28 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-20 items-center">
            {/* Left — Brand + Copy */}
            <div className="text-center lg:text-left">
              {/* Brand name logo — legible, prominent */}
              <img
                src="/FOC_name_logo_white.svg"
                alt="Family Owned Contractors"
                className="h-6 sm:h-8 lg:h-10 w-auto mb-8 sm:mb-10 opacity-50 mx-auto lg:mx-0"
              />

              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[4.25rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5 sm:mb-7">
                Better work.{' '}
                <br className="hidden sm:block" />
                Better price.{' '}
                <br className="hidden sm:block" />
                <span className="text-brand-lightgreen">Family proud.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-white/55 mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Family-owned contractors don't cut corners — their name is on every job. Get free quotes from local pros who actually care.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-5">
                <Button
                  size="lg"
                  onClick={() => navigate('/home-services')}
                  className="w-full sm:w-auto py-5 sm:py-7 px-8 sm:px-10 text-base sm:text-lg font-bold bg-brand-lightgreen hover:bg-brand-green text-white shadow-[0_4px_24px_rgba(124,191,68,0.3)] hover:shadow-[0_8px_40px_rgba(124,191,68,0.45)] transform hover:scale-[1.02] transition-all duration-300 rounded-xl"
                >
                  Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <span className="text-xs sm:text-[13px] text-white/30 self-center tracking-wide">100% free — no obligation</span>
              </div>
            </div>

            {/* Right — Why Family Owned */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-white/[0.04] to-brand-lightgreen/[0.03] rounded-[28px] blur-2xl" />
                <div className="relative bg-white/[0.05] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 lg:p-9">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-lightgreen/80 mb-7">Why Family Owned</p>
                  <div className="space-y-6">
                    {whyFamilyOwned.map((point, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-brand-lightgreen shrink-0 mt-0.5">
                          {point.icon}
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-white/90 mb-1">{point.title}</p>
                          <p className="text-[13px] text-white/40 leading-relaxed">{point.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile — Why Family Owned */}
          <div className="lg:hidden mt-10 sm:mt-14 max-w-sm mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-lightgreen/80 mb-4 text-center">Why Family Owned</p>
            <div className="grid grid-cols-2 gap-2.5">
              {whyFamilyOwned.map((point, i) => (
                <div key={i} className="bg-white/[0.05] border border-white/[0.07] rounded-xl p-3 sm:p-4 text-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-brand-lightgreen mx-auto mb-2">
                    {point.icon}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white/85 leading-snug">{point.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 sm:h-12 lg:h-14" preserveAspectRatio="none">
            <path d="M0 56h1440V18L0 56z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-14 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green/70 mb-3">Our Services</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-3 sm:mb-4">
              What Do You Need Help With?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Select a service to get matched with qualified local contractors who will compete for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card
                key={service.id}
                onClick={() => navigate(service.path)}
                className="p-6 cursor-pointer group hover:shadow-custom-lg transition-all duration-300 border border-border/80 hover:border-brand-navy/20 hover:-translate-y-0.5 bg-white"
              >
                <div className="w-12 h-12 bg-brand-navy rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-105 group-hover:bg-brand-blue transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5 group-hover:text-brand-navy transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-sm font-bold text-brand-navy group-hover:gap-2 transition-all">
                  Get Free Quote <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green/70 mb-3">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Select Your Service',
                description: 'Choose the home service you need help with from our list of categories.',
              },
              {
                step: '2',
                title: 'Answer a Few Questions',
                description: 'Tell us about your project so we can match you with the right contractors.',
              },
              {
                step: '3',
                title: 'Get Free Quotes',
                description: 'Receive quotes from qualified local pros and choose the best one for you.',
              },
            ].map((item, idx) => (
              <div key={item.step} className="text-center relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-border/60" />
                )}
                <div className="w-14 h-14 bg-brand-navy text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-extrabold shadow-md ring-4 ring-brand-navy/[0.06] relative z-10">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button
              size="lg"
              onClick={() => navigate('/home-services')}
              className="py-6 px-10 text-lg font-bold shadow-button hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            >
              Get Started — It's Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 sm:py-20 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(1,100,174,0.2) 0%, transparent 70%)',
        }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4">
            Work With People Who Care
          </h2>
          <p className="text-white/50 mb-8 sm:mb-10 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Family-owned means personal pride in every project. Get free quotes from contractors who treat your home like their own.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/home-services')}
            className="w-full sm:w-auto py-5 sm:py-7 px-8 sm:px-10 text-base sm:text-lg font-bold bg-brand-lightgreen hover:bg-brand-green text-white shadow-[0_4px_24px_rgba(124,191,68,0.3)] hover:shadow-[0_6px_32px_rgba(124,191,68,0.45)] rounded-xl transition-all duration-300"
          >
            <Phone className="mr-2 h-5 w-5" /> Get Your Free Quote
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 border-t border-border/60 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-5 sm:flex-row sm:justify-between">
            <a href="/" className="flex items-center">
              <img
                src="/FOC_less_logo.svg"
                alt="Family Owned Contractors"
                className="h-8 sm:h-10 w-auto opacity-70"
              />
            </a>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-brand-navy transition-colors">Privacy Policy</a>
              <span className="text-border">|</span>
              <a href="/terms" className="hover:text-brand-navy transition-colors">Terms of Service</a>
              <span className="text-border">|</span>
              <a href="/do-not-sell" className="hover:text-brand-navy transition-colors">Do Not Sell My Info</a>
              <span className="text-border">|</span>
              <a href="/partners" className="hover:text-brand-navy transition-colors">Partners</a>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} FamilyOwnedContractors.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
