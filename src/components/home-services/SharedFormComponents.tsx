/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, MapPin, User, Phone, Mail, Home, ChevronRight
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FormAnswers {
  // Contact Info
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  // Address
  property_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  street_address?: string;
  manual_city?: string;
  manual_state?: string;
  manual_zip?: string;
  // Common
  home_owner?: string;
  [key: string]: any;
}

export interface StepProps {
  answers: FormAnswers;
  handleAnswer: (field: string, value: any) => void;
  onNext?: () => void;
}

export interface OptionItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

// ============================================================================
// ANIMATED CARD COMPONENT
// ============================================================================

export const AnimatedCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <Card className={`p-4 sm:p-6 bg-white shadow-custom-lg border-2 border-border max-w-xl mx-auto relative overflow-hidden transform transition-all duration-500 ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-navy via-brand-blue to-brand-navy"></div>
    <div className="relative z-10">
      {children}
    </div>
  </Card>
);

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

export const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="mb-6">
    <div className="w-full bg-border rounded-full h-2">
      <div
        className="bg-brand-navy h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
    <div className="text-center mt-2">
      <span className="text-xs font-medium text-muted-foreground">Step {currentStep} of {totalSteps}</span>
    </div>
  </div>
);

// ============================================================================
// OPTION BUTTON COMPONENT
// ============================================================================

export const OptionButton = ({
  option,
  isSelected,
  onClick,
  fullWidth = true,
  size = 'default'
}: {
  option: OptionItem;
  isSelected: boolean;
  onClick: () => void;
  fullWidth?: boolean;
  size?: 'default' | 'compact';
}) => (
  <Button
    variant={isSelected ? "default" : "outline"}
    onClick={onClick}
    className={`${fullWidth ? 'w-full' : ''} ${size === 'compact' ? 'py-4 sm:py-5 px-3 text-sm sm:text-base' : 'py-4 sm:py-6 px-3 sm:px-4 text-base sm:text-lg'} font-bold transition-all duration-200 ${
      isSelected
        ? 'bg-brand-navy text-white shadow-button scale-[1.02] border-2 border-brand-navy'
        : 'border-2 border-border hover:bg-brand-navy/5 hover:text-brand-navy hover:border-brand-navy/40'
    }`}
  >
    {option.icon && <span className="mr-2">{option.icon}</span>}
    {option.label}
  </Button>
);

// ============================================================================
// STEP HEADER COMPONENT
// ============================================================================

export const StepHeader = ({
  icon,
  iconColor,
  title,
  subtitle
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="text-center mb-6">
    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-brand-navy rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg ring-4 ring-brand-navy/10`}>
      {icon}
    </div>
    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground mb-2 sm:mb-3 leading-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="text-sm sm:text-base text-muted-foreground mb-2">
        {subtitle}
      </p>
    )}
  </div>
);

// ============================================================================
// STEP FOOTER COMPONENT
// ============================================================================

export const StepFooter = ({ text = "100% Free Quotes - No Obligation" }: { text?: string }) => (
  <div className="text-center mt-4">
    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
      {text}
    </p>
  </div>
);

// ============================================================================
// HOME OWNER STEP COMPONENT
// ============================================================================

export const HomeOwnerStep = ({ answers, handleAnswer, onNext }: StepProps) => {
  const options: OptionItem[] = [
    { label: 'Yes, I am the homeowner', value: 'True' },
    { label: 'No, I am not the homeowner', value: 'False' }
  ];

  return (
    <AnimatedCard>
      <StepHeader
        icon={<Home className="h-8 w-8 text-white" />}
        iconColor="from-green-500 to-green-600"
        title="Are You the Homeowner?"
        subtitle="We need to speak with the property owner"
      />

      <div className="space-y-2 mb-6">
        {options.map((option) => (
          <OptionButton
            key={option.value}
            option={option}
            isSelected={answers.home_owner === option.value}
            onClick={() => {
              handleAnswer('home_owner', option.value);
              onNext?.();
            }}
          />
        ))}
      </div>

      <StepFooter />
    </AnimatedCard>
  );
};

// ============================================================================
// ADDRESS STEP COMPONENT
// ============================================================================

export const AddressStep = ({ answers, handleAnswer, onNext }: StepProps) => {
  const [addressInput, setAddressInput] = useState(answers.property_address || '');
  const [isAddressSelected, setIsAddressSelected] = useState(!!answers.property_address);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [mapsLoadFailed, setMapsLoadFailed] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [manualAddress, setManualAddress] = useState({
    street: answers.street_address || '',
    city: answers.manual_city || '',
    state: answers.manual_state || '',
    zip: answers.manual_zip || ''
  });

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyChtAF62LK9EKAsu2jv75MPfiLODwCWouw&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Failed to load Google Maps');
          setMapsLoadFailed(true);
        };
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      } else {
        initAutocomplete();
      }
    };

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();

          if (!place || !place.address_components) {
            setIsAddressSelected(false);
            return;
          }

          const addressComponents = place.address_components;
          let city = '';
          let state = '';
          let zip = '';

          for (const component of addressComponents) {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
            if (types.includes('postal_code')) {
              zip = component.long_name;
            }
          }

          handleAnswer('property_address', place.formatted_address || '');
          if (city) handleAnswer('city', city);
          if (state) handleAnswer('state', state);
          if (zip) handleAnswer('zip_code', zip);

          setAddressInput(place.formatted_address || '');
          setIsAddressSelected(true);
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setMapsLoadFailed(true);
      }
    };

    if (!showManualEntry) {
      loadGoogleMaps();
    }
  }, [handleAnswer, showManualEntry]);

  const isManualEntryValid = () => {
    return manualAddress.street.trim() !== '' &&
           manualAddress.city.trim() !== '' &&
           manualAddress.state.trim() !== '' &&
           manualAddress.zip.trim() !== '';
  };

  const handleManualAddressChange = (field: string, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));

    if (field === 'street') {
      handleAnswer('street_address', value);
    } else if (field === 'city') {
      handleAnswer('manual_city', value);
      handleAnswer('city', value);
    } else if (field === 'state') {
      handleAnswer('manual_state', value);
      handleAnswer('state', value);
    } else if (field === 'zip') {
      handleAnswer('manual_zip', value);
      handleAnswer('zip_code', value);
    }

    const fullAddress = `${field === 'street' ? value : manualAddress.street}, ${field === 'city' ? value : manualAddress.city}, ${field === 'state' ? value : manualAddress.state} ${field === 'zip' ? value : manualAddress.zip}`;
    handleAnswer('property_address', fullAddress);
  };

  const canProceed = showManualEntry
    ? isManualEntryValid()
    : (answers.property_address && answers.property_address.trim() !== '' && (isAddressSelected || mapsLoadFailed));

  return (
    <AnimatedCard>
      <StepHeader
        icon={<MapPin className="h-8 w-8 text-white" />}
        iconColor="from-blue-500 to-blue-600"
        title="What's the Property Address?"
        subtitle="We'll match you with local contractors"
      />

      {!showManualEntry ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium">
              Property Address
            </Label>
            <Input
              ref={inputRef}
              id="address"
              type="text"
              placeholder="Start typing your address..."
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setIsAddressSelected(false);
              }}
              className="w-full text-base sm:text-lg py-4 sm:py-6"
            />
            {!isAddressSelected && addressInput && (
              <p className="text-sm text-muted-foreground">
                Select an address from the dropdown
              </p>
            )}
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowManualEntry(true)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Can't find your address? Enter manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street" className="text-base font-medium">
              Street Address
            </Label>
            <Input
              id="street"
              type="text"
              placeholder="123 Main St"
              value={manualAddress.street}
              onChange={(e) => handleManualAddressChange('street', e.target.value)}
              className="w-full text-base sm:text-lg py-4 sm:py-6"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base font-medium">
                City
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="City"
                value={manualAddress.city}
                onChange={(e) => handleManualAddressChange('city', e.target.value)}
                className="w-full text-base sm:text-lg py-4 sm:py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-base font-medium">
                State
              </Label>
              <Input
                id="state"
                type="text"
                placeholder="CA"
                maxLength={2}
                value={manualAddress.state}
                onChange={(e) => handleManualAddressChange('state', e.target.value.toUpperCase())}
                className="w-full text-base sm:text-lg py-4 sm:py-6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip" className="text-base font-medium">
              ZIP Code
            </Label>
            <Input
              id="zip"
              type="text"
              placeholder="12345"
              maxLength={5}
              value={manualAddress.zip}
              onChange={(e) => handleManualAddressChange('zip', e.target.value)}
              className="w-full text-base sm:text-lg py-4 sm:py-6"
            />
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowManualEntry(false)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to address search
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-6 text-lg font-semibold transition-all duration-200 mt-4"
      >
        Next <ChevronRight className="ml-2 h-5 w-5" />
      </Button>

      <StepFooter />
    </AnimatedCard>
  );
};

// ============================================================================
// CONTACT INFO STEP COMPONENT
// ============================================================================

export const ContactInfoStep = ({
  answers,
  handleAnswer,
  onSubmit,
  isLoading,
  title = "Get Your Free Quote!",
  subtitle = "A specialist will contact you shortly",
  buttonText = "Get My Free Quote"
}: StepProps & {
  onSubmit: () => void;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!answers.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (answers.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    } else if (answers.first_name.trim().length > 50) {
      newErrors.first_name = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s\-']+$/.test(answers.first_name.trim())) {
      newErrors.first_name = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!answers.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (answers.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    } else if (answers.last_name.trim().length > 50) {
      newErrors.last_name = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s\-']+$/.test(answers.last_name.trim())) {
      newErrors.last_name = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!answers.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      const cleanedPhone = answers.phone_number.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        newErrors.phone_number = 'Please enter a valid 10-digit phone number';
      } else if (cleanedPhone.startsWith('1')) {
        newErrors.phone_number = 'Phone number cannot start with 1';
      }
    }

    if (!answers.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <AnimatedCard>
      <StepHeader
        icon={<CheckCircle className="h-8 w-8 text-white" />}
        iconColor="from-primary to-primary/80"
        title={title}
        subtitle={subtitle}
      />

      <div className="bg-brand-green/5 p-4 rounded-lg border-2 border-brand-green/20 mb-6">
        <p className="text-sm font-bold text-brand-green flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Compare quotes from top-rated local pros
        </p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
              <User className="h-5 w-5" /> First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={answers.first_name || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
                if (value.length <= 50) {
                  handleAnswer('first_name', value);
                }
              }}
              className={`text-base sm:text-lg py-4 sm:py-6 ${errors.first_name ? 'border-red-500' : ''}`}
              maxLength={50}
              required
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={answers.last_name || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
                if (value.length <= 50) {
                  handleAnswer('last_name', value);
                }
              }}
              className={`text-base sm:text-lg py-4 sm:py-6 ${errors.last_name ? 'border-red-500' : ''}`}
              maxLength={50}
              required
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
            <Phone className="h-5 w-5" /> Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={answers.phone_number || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 10 && value.startsWith('1')) {
                value = value.substring(1);
              }
              const limitedValue = value.slice(0, 10);
              let formatted = limitedValue;
              if (limitedValue.length >= 6) {
                formatted = limitedValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
              } else if (limitedValue.length >= 3) {
                formatted = limitedValue.replace(/(\d{3})(\d{0,3})/, '($1) $2');
              } else if (limitedValue.length > 0) {
                formatted = `(${limitedValue}`;
              }
              handleAnswer('phone_number', formatted);
            }}
            maxLength={14}
            className={`text-base sm:text-lg py-4 sm:py-6 ${errors.phone_number ? 'border-red-500' : ''}`}
            required
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
            <Mail className="h-5 w-5" /> Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={answers.email || ''}
            onChange={(e) => {
              handleAnswer('email', e.target.value);
            }}
            className={`text-base sm:text-lg py-4 sm:py-6 ${errors.email ? 'border-red-500' : ''}`}
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <TCPAConsent />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-6 text-lg font-bold bg-brand-green hover:bg-brand-green/90 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-6 border-2 border-brand-green"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            buttonText
          )}
        </Button>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            100% Free - No Obligation
          </p>
        </div>
      </form>
    </AnimatedCard>
  );
};

// ============================================================================
// TCPA CONSENT COMPONENT
// ============================================================================

export const TCPAConsent = () => (
  <p className="text-xs text-muted-foreground text-center leading-relaxed mt-4">
    By submitting, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its{' '}
    <a
      href="/partners"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:text-primary/80"
    >
      marketing partners
    </a>
    , including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the{' '}
    <a
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:text-primary/80"
    >
      Privacy Policy
    </a>
    {' '}and{' '}
    <a
      href="/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:text-primary/80"
    >
      Terms of Service
    </a>.
  </p>
);

// ============================================================================
// COMPLIANCE FOOTER COMPONENT
// ============================================================================

export const ComplianceFooter = () => (
  <footer className="mt-8 pt-6 border-t border-border">
    <div className="text-center space-y-3">
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-brand-navy hover:underline transition-colors">
          Privacy Policy
        </a>
        <span className="text-border">|</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-brand-navy hover:underline transition-colors">
          Terms of Service
        </a>
        <span className="text-border">|</span>
        <a href="/do-not-sell" target="_blank" rel="noopener noreferrer" className="hover:text-brand-navy hover:underline transition-colors">
          Do Not Sell My Info
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} FamilyOwnedContractors.com. All rights reserved.
      </p>
    </div>
  </footer>
);

// ============================================================================
// SUCCESS SCREEN COMPONENT
// ============================================================================

export const SuccessScreen = ({
  serviceName = "home service"
}: {
  title?: string;
  message?: string;
  serviceName?: string;
}) => {
  // Service-specific wording
  const serviceConfig: Record<string, { displayName: string; specialist: string }> = {
    roofing: { displayName: 'roofing', specialist: 'roofer' },
    windows: { displayName: 'window', specialist: 'window specialist' },
    bath: { displayName: 'bathroom', specialist: 'bath remodel specialist' },
    hvac: { displayName: 'HVAC', specialist: 'HVAC technician' },
    kitchen: { displayName: 'kitchen', specialist: 'kitchen remodel specialist' },
    plumbing: { displayName: 'plumbing', specialist: 'plumber' },
  };

  const config = serviceConfig[serviceName] || { displayName: serviceName, specialist: 'specialist' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <AnimatedCard className="text-center">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl ring-4 ring-brand-green/20">
          <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
          🎉 Congratulations! Your Request Is Confirmed!
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-4">
          You've successfully taken the first step toward getting your {config.displayName} project handled by a trusted local expert.
        </p>
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-orange-300 mb-6 shadow-lg">
          <h3 className="font-bold text-orange-900 mb-2">📞 Don't Miss the Call</h3>
          <p className="text-sm text-orange-800">
            A local {config.specialist} will call within 15–30 minutes.<br />
            👉 Keep your phone nearby and answer.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🔍 What Happens Next</h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li>📝 We review your details (in progress)</li>
            <li>📞 You receive a quick call to confirm needs</li>
            <li>🏠 Get your free quote — no obligation</li>
          </ul>
        </div>
      </AnimatedCard>
    </div>
  );
};

// ============================================================================
// SOCIAL PROOF COMPONENT
// ============================================================================

export const SocialProof = ({ serviceName = "homeowners" }: { serviceName?: string }) => (
  <div className="mt-6 text-center">
    <p className="text-sm text-muted-foreground mb-3">
      <span className="font-bold text-foreground">Thousands of {serviceName}</span> get quotes every month
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-brand-green" />
        <span className="font-medium">Free quotes</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-brand-green" />
        <span className="font-medium">Licensed pros</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-brand-green" />
        <span className="font-medium">No obligation</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// SERVICE CARD COMPONENT (for Hub page)
// ============================================================================

export const ServiceCard = ({
  icon,
  title,
  description,
  isSelected,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Card
    onClick={onClick}
    className={`p-4 cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'border-2 border-brand-navy bg-brand-navy/5 shadow-custom-md scale-[1.02]'
        : 'border-2 border-border hover:border-brand-navy/30 hover:bg-muted/50'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-navy text-white' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-bold ${isSelected ? 'text-brand-navy' : 'text-foreground'}`}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {isSelected && (
        <CheckCircle className="h-5 w-5 text-brand-green" />
      )}
    </div>
  </Card>
);
