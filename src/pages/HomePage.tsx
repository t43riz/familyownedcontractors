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
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'Heating & cooling repair, installation, and maintenance services.',
    icon: <Thermometer className="h-7 w-7" />,
    path: '/hvac',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
  },
  {
    id: 'bath',
    title: 'Bath Remodel',
    description: 'Bathroom renovations, tub-to-shower conversions & walk-in tubs.',
    icon: <Layers className="h-7 w-7" />,
    path: '/bath',
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    id: 'windows',
    title: 'Windows',
    description: 'Window replacement & installation with energy-efficient options.',
    icon: <Square className="h-7 w-7" />,
    path: '/windows',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    id: 'kitchen',
    title: 'Kitchen Remodel',
    description: 'Full and partial kitchen renovations from local specialists.',
    icon: <UtensilsCrossed className="h-7 w-7" />,
    path: '/kitchen',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Plumbing repairs, drain cleaning, water heaters & emergency service.',
    icon: <Droplets className="h-7 w-7" />,
    path: '/plumbing',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
  },
];

const trustPoints = [
  { icon: <Shield className="h-5 w-5" />, text: 'Licensed & Insured Pros' },
  { icon: <Star className="h-5 w-5" />, text: 'Top-Rated Local Contractors' },
  { icon: <CheckCircle className="h-5 w-5" />, text: '100% Free, No Obligation' },
  { icon: <Users className="h-5 w-5" />, text: 'Family Owned Businesses' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Family Owned<span className="text-primary"> Contractors</span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/home-services')}
            className="hidden sm:flex"
          >
            Get Free Quotes <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Trusted Home Services from{' '}
              <span className="text-primary">Local Family-Owned</span> Contractors
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get free, no-obligation quotes from licensed, top-rated contractors in your area. Roofing, HVAC, plumbing, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button
                size="lg"
                onClick={() => navigate('/home-services')}
                className="py-6 px-8 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-6 px-8 text-lg"
              >
                Browse Services
              </Button>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="text-green-600">{point.icon}</span>
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Select a service below to get matched with qualified local contractors who will compete for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card
                key={service.id}
                onClick={() => navigate(service.path)}
                className="p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Get Free Quote <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to your free quote.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/home-services')}
              className="py-6 px-10 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Get Started - It's Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Start Your Project?
          </h2>
          <p className="text-primary-foreground/80 mb-6 text-lg">
            Compare quotes from top-rated local contractors today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/home-services')}
            className="py-6 px-10 text-lg font-bold shadow-lg hover:shadow-xl"
          >
            <Phone className="mr-2 h-5 w-5" /> Get Your Free Quote
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">Family Owned Contractors</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-primary hover:underline">Privacy Policy</a>
              <span className="text-gray-300">|</span>
              <a href="/terms" className="hover:text-primary hover:underline">Terms of Service</a>
              <span className="text-gray-300">|</span>
              <a href="/do-not-sell" className="hover:text-primary hover:underline">Do Not Sell My Info</a>
              <span className="text-gray-300">|</span>
              <a href="/partners" className="hover:text-primary hover:underline">Partners</a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} FamilyOwnedContractors.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
