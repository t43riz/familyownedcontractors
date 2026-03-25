import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Star, Clock, Shield, ChevronRight, ArrowLeft,
  CheckCircle, MapPin, Loader2, X, Users, Award
} from 'lucide-react';
import {
  AnimatedCard,
  SocialProof,
  ComplianceFooter,
  StepHeader,
  StepFooter,
} from './SharedFormComponents';
import {
  ThumbtackServiceConfig,
  ThumbtackBusiness,
  searchThumbtackPros,
} from '@/services/thumbtackConfig';

type LanderState = 'zip-entry' | 'loading' | 'pro-list' | 'request-flow' | 'success';

interface ThumbtackLanderProps {
  config: ThumbtackServiceConfig;
}

// ============================================================================
// PRO CARD COMPONENT
// ============================================================================

const ProCard = ({
  business,
  onSelect,
}: {
  business: ThumbtackBusiness;
  onSelect: (business: ThumbtackBusiness) => void;
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return `${mins} min`;
    }
    return `${Math.round(hours)} hr`;
  };

  return (
    <div
      className="bg-white border-2 border-border rounded-xl p-4 sm:p-5 hover:border-brand-navy/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(business)}
    >
      <div className="flex gap-4">
        {/* Business Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100">
            {business.businessImageURL ? (
              <img
                src={business.businessImageURL}
                alt={business.businessName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-navy/10">
                <Users className="h-8 w-8 text-brand-navy/40" />
              </div>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight group-hover:text-brand-navy transition-colors">
                {business.businessName}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{business.businessLocation}</span>
              </div>
            </div>
            {business.isTopPro && (
              <span className="flex-shrink-0 bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                TOP PRO
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">{renderStars(business.rating)}</div>
            <span className="text-sm font-semibold text-foreground">{business.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({business.numberOfReviews} reviews)</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {business.numberOfHires > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {business.numberOfHires} hires
              </span>
            )}
            {business.yearsInBusiness > 0 && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {business.yearsInBusiness} yrs in business
              </span>
            )}
            {business.responseTimeHours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Responds in ~{formatResponseTime(business.responseTimeHours)}
              </span>
            )}
            {business.isBackgroundChecked && (
              <span className="flex items-center gap-1 text-brand-green">
                <Shield className="h-3 w-3" />
                Background checked
              </span>
            )}
          </div>

          {/* Featured Review */}
          {business.featuredReview && (
            <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">
              "{business.featuredReview}" — {business.featuredReviewerName}
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        {business.quote.costUnit && (
          <span className="text-xs text-muted-foreground">
            {business.quote.startingCost > 0
              ? `From $${business.quote.startingCost}`
              : `Free ${business.quote.costUnit}`}
          </span>
        )}
        <Button
          size="sm"
          className="ml-auto bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold gap-1"
        >
          Get Quote <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// THUMBTACK REQUEST FLOW IFRAME
// ============================================================================

const ThumbtackRequestFlow = ({
  url,
  onRequestCreated,
  onClose,
}: {
  url: string;
  onRequestCreated: () => void;
  onClose: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only trust Thumbtack origins
      if (!event.origin.includes('thumbtack.com')) return;

      const data = typeof event.data === 'string' ? event.data : event.data?.type;

      if (data === 'THUMBTACK_RF_REQUEST_CREATED') {
        onRequestCreated();
      } else if (data === 'THUMBTACK_RF_CLOSE') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRequestCreated, onClose]);

  // Timeout fallback for loading state
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 8000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-navy mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading request form...</p>
          </div>
        </div>
      )}
      <iframe
        src={url}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        className="w-full border-0 rounded-xl"
        style={{ minHeight: '700px', height: '80vh', maxHeight: '900px' }}
        onLoad={() => setIsLoading(false)}
        title="Request a quote"
      />
    </div>
  );
};

// ============================================================================
// MAIN LANDER COMPONENT
// ============================================================================

export default function ThumbtackLander({ config }: ThumbtackLanderProps) {
  const [state, setState] = useState<LanderState>('zip-entry');
  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [businesses, setBusinesses] = useState<ThumbtackBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<ThumbtackBusiness | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleZipSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setZipError('');
    setSearchError('');

    const cleaned = zipCode.replace(/\D/g, '');
    if (cleaned.length !== 5) {
      setZipError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setState('loading');

    try {
      const result = await searchThumbtackPros(config.searchQuery, cleaned, 10);
      if (result.data && result.data.length > 0) {
        setBusinesses(result.data);
        setState('pro-list');
      } else {
        setSearchError('No pros found in your area. Try a different ZIP code.');
        setState('zip-entry');
      }
    } catch {
      setSearchError('Unable to search for pros. Please try again.');
      setState('zip-entry');
    }
  }, [zipCode, config.searchQuery]);

  const handleSelectBusiness = useCallback((business: ThumbtackBusiness) => {
    setSelectedBusiness(business);
    setState('request-flow');
  }, []);

  const handleRequestCreated = useCallback(() => {
    setState('success');
  }, []);

  const handleIframeClose = useCallback(() => {
    setState('pro-list');
    setSelectedBusiness(null);
  }, []);

  const handleBackToZip = useCallback(() => {
    setState('zip-entry');
    setBusinesses([]);
    setSelectedBusiness(null);
    setSearchError('');
  }, []);

  const handleBackToList = useCallback(() => {
    setState('pro-list');
    setSelectedBusiness(null);
  }, []);

  // ============================================================================
  // ZIP ENTRY VIEW
  // ============================================================================
  if (state === 'zip-entry' || state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <AnimatedCard>
              <StepHeader
                icon={<Search className="h-8 w-8 text-white" />}
                iconColor="from-blue-500 to-blue-600"
                title={config.headline}
                subtitle={config.subtitle}
              />

              <form onSubmit={handleZipSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your ZIP code"
                      value={zipCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setZipCode(val);
                        setZipError('');
                      }}
                      className="pl-10 h-14 text-lg border-2 focus:border-brand-navy"
                      autoFocus
                      disabled={state === 'loading'}
                    />
                  </div>
                  {zipError && (
                    <p className="text-sm text-red-500 mt-1">{zipError}</p>
                  )}
                  {searchError && (
                    <p className="text-sm text-red-500 mt-1">{searchError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={state === 'loading' || zipCode.length < 5}
                  className="w-full h-14 text-lg font-bold bg-brand-navy hover:bg-brand-navy/90 text-white"
                >
                  {state === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Finding Pros...
                    </>
                  ) : (
                    <>
                      Find Pros <ChevronRight className="h-5 w-5 ml-1" />
                    </>
                  )}
                </Button>
              </form>

              <StepFooter text="100% Free - No Obligation" />
            </AnimatedCard>

            <SocialProof serviceName="homeowners" />
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full px-4">
          <ComplianceFooter />
        </div>
      </div>
    );
  }

  // ============================================================================
  // PRO LIST VIEW
  // ============================================================================
  if (state === 'pro-list') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
        <div className="flex-1 p-4">
          <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={handleBackToZip}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-navy transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" /> Change ZIP code
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {config.displayName} Pros in {zipCode}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {businesses.length} pro{businesses.length !== 1 ? 's' : ''} found — select one to get a free quote
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Cards */}
            <div className="space-y-4">
              {businesses.map((business) => (
                <ProCard
                  key={business.businessID}
                  business={business}
                  onSelect={handleSelectBusiness}
                />
              ))}
            </div>

            <SocialProof serviceName="homeowners" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4">
          <ComplianceFooter />
        </div>
      </div>
    );
  }

  // ============================================================================
  // REQUEST FLOW IFRAME VIEW
  // ============================================================================
  if (state === 'request-flow' && selectedBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
        <div className="flex-1 p-4">
          <div className="w-full max-w-2xl mx-auto">
            {/* Header bar */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-navy transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to pros
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{selectedBusiness.businessName}</p>
                <p className="text-xs text-muted-foreground">{selectedBusiness.businessLocation}</p>
              </div>
            </div>

            {/* Thumbtack iframe */}
            <ThumbtackRequestFlow
              url={selectedBusiness.widgets.requestFlowURL}
              onRequestCreated={handleRequestCreated}
              onClose={handleIframeClose}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4">
          <ComplianceFooter />
        </div>
      </div>
    );
  }

  // ============================================================================
  // SUCCESS VIEW
  // ============================================================================
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <AnimatedCard className="text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl ring-4 ring-brand-green/20">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Your Request Has Been Sent!
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              Local {config.displayName.toLowerCase()} pros will reach out with quotes. Check your email and phone for responses.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">What Happens Next</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Pros review your request and send personalized quotes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Compare prices, reviews, and availability
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Hire the pro that's right for you — no obligation
                </li>
              </ul>
            </div>
            <Button
              onClick={handleBackToZip}
              variant="outline"
              className="w-full border-2"
            >
              Search Another Area
            </Button>
          </AnimatedCard>
          <div className="mt-8">
            <ComplianceFooter />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
