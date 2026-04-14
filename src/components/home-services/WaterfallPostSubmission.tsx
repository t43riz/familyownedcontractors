/**
 * Post-submission screens for the 3-tier waterfall routing.
 * - Tier A (pingpost): Normal success screen
 * - Tier B (rtb): "Call Now" screen with Sparrow edge-inject phone number
 * - Tier C (thumbtack): Redirect to Thumbtack lander
 */
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, CheckCircle, ArrowRight, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuccessScreen, ComplianceFooter, AnimatedCard } from './SharedFormComponents';
import type { RoutingResult } from '@/services/leadRoutingApi';
import type { ServiceType } from '@/services/homeServicesApi';

interface WaterfallPostSubmissionProps {
  result: RoutingResult;
  serviceType: ServiceType;
  serviceName: string;
  zipCode: string;
}

const THUMBTACK_ROUTES: Record<string, string> = {
  roofing: '/roofing-tt',
  hvac: '/hvac-tt',
  windows: '/windows-tt',
};

/**
 * RTB "Call Now" screen displayed when Sparrow finds a buyer.
 */
const CallNowScreen = ({
  phoneNumber,
  serviceName,
  expiresInSeconds,
}: {
  phoneNumber: string;
  serviceName: string;
  expiresInSeconds?: number;
}) => {
  const formatPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  const telLink = `tel:${phoneNumber.startsWith('+') ? phoneNumber : '+1' + phoneNumber.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <AnimatedCard className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-green-200 animate-pulse">
            <Phone className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Great News! A {serviceName} Pro Is Available Now
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Call the number below to speak with a qualified {serviceName} specialist immediately.
          </p>

          {/* Phone number display */}
          <a
            href={telLink}
            className="block bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <p className="text-sm font-medium opacity-90 mb-1">Tap to Call Now</p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-wide">
              {formatPhone(phoneNumber)}
            </p>
          </a>

          {expiresInSeconds && expiresInSeconds > 0 && (
            <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 rounded-lg p-3 mb-6 border border-amber-200">
              <Clock className="h-4 w-4" />
              <p className="text-sm font-medium">
                This line is reserved for you -- call within {Math.ceil(expiresInSeconds / 60)} minutes
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-semibold text-foreground mb-3">What to Expect</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                A qualified {serviceName} specialist will answer
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                Discuss your project details and get expert advice
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                Receive a free quote -- no obligation
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Licensed & insured professionals</span>
          </div>
        </AnimatedCard>

        <div className="mt-8 max-w-xl mx-auto">
          <ComplianceFooter />
        </div>
      </div>
    </div>
  );
};

/**
 * Thumbtack redirect handler. Navigates to the Thumbtack lander with zip pre-filled.
 */
const ThumbtackRedirect = ({
  serviceType,
  zipCode,
}: {
  serviceType: ServiceType;
  zipCode: string;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const route = THUMBTACK_ROUTES[serviceType];
    if (route) {
      const params = new URLSearchParams(searchParams);
      params.set('zip', zipCode);
      navigate(`${route}?${params.toString()}`, { replace: true });
    }
  }, [serviceType, zipCode, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Finding pros in your area...</p>
      </div>
    </div>
  );
};

/**
 * Main post-submission component that renders the appropriate screen
 * based on which tier of the waterfall matched.
 */
export default function WaterfallPostSubmission({
  result,
  serviceType,
  serviceName,
  zipCode,
}: WaterfallPostSubmissionProps) {
  switch (result.tier) {
    case 'pingpost':
      return (
        <SuccessScreen
          title="Thank You!"
          message={`Your ${serviceName} quote request has been received. A qualified ${serviceName} specialist in your area will contact you shortly.`}
          serviceName={serviceName}
        />
      );

    case 'rtb':
      return (
        <CallNowScreen
          phoneNumber={result.rtb!.phone_number!}
          serviceName={serviceName}
          expiresInSeconds={result.rtb!.expires_in_seconds}
        />
      );

    case 'thumbtack':
      return (
        <ThumbtackRedirect
          serviceType={serviceType}
          zipCode={zipCode}
        />
      );

    default:
      return null;
  }
}

export { CallNowScreen, ThumbtackRedirect };
