/**
 * Spec-Compliant Kitchen Remodel Landing Page
 * Following HOME_SERVICES_LANDING_PAGE_SPEC.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed } from 'lucide-react';
import {
  AnimatedCard,
  ProgressBar,
  OptionButton,
  StepHeader,
  StepFooter,
  HomeOwnerStep,
  AddressStep,
  ContactInfoStep,
  SuccessScreen,
  SocialProof,
  ComplianceFooter,
  FormAnswers,
  OptionItem
} from './SharedFormComponents';
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead } from '@/services/homeServicesApi';

// ============================================================================
// CONSTANTS
// ============================================================================

const TOTAL_STEPS = 4;

// API spec values: "Kitchen Remodel no walls added or removed" OR "Kitchen Remodel remove or add walls"
const serviceOptions: OptionItem[] = [
  { label: 'Kitchen Remodel (no walls changed)', value: 'Kitchen Remodel no walls added or removed' },
  { label: 'Kitchen Remodel (walls changed)', value: 'Kitchen Remodel remove or add walls' }
];

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Step 1: Service Type
const Step1 = ({ answers, handleAnswer, onNext }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void; onNext: () => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<UtensilsCrossed className="h-8 w-8 text-white" />}
      iconColor="from-amber-500 to-orange-600"
      title="What Type of Kitchen Remodel?"
      subtitle="Select the scope of your project"
    />

    <div className="space-y-2 mb-6">
      {serviceOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.service === option.value}
          onClick={() => {
            handleAnswer('service', option.value);
            onNext();
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KitchenLander() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<LeadData | null>(null);
  const [queryParams, setQueryParams] = useState<{ [key: string]: string }>({});
  const [actualTotalSteps, setActualTotalSteps] = useState(TOTAL_STEPS);
  const [detectedLeadId, setDetectedLeadId] = useState<string>('');
  const [detectedTrustedFormCert, setDetectedTrustedFormCert] = useState<string>('');

  // Monitor Jornaya LeadID and TrustedForm token population
  useEffect(() => {
    const monitorTokens = () => {
      const leadIdElement = document.getElementById('leadid_token') as HTMLInputElement;
      if (leadIdElement && leadIdElement.value) setDetectedLeadId(leadIdElement.value);
      const tfElement = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
      if (tfElement && tfElement.value) setDetectedTrustedFormCert(tfElement.value);
    };
    const interval = setInterval(monitorTokens, 1000);
    monitorTokens();
    setTimeout(monitorTokens, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get Jornaya LeadID token
  const getLeadIdToken = (): string => {
    if (detectedLeadId) return detectedLeadId;
    const leadidTokenElement = document.getElementById('leadid_token') as HTMLInputElement;
    if (leadidTokenElement?.value) return leadidTokenElement.value;
    const allLeadIdInputs = document.querySelectorAll('input[name*="leadid"], input[name*="universal_leadid"], input[id*="leadid"], input[name*="LeadId"], input[id*="LeadId"]');
    for (const input of allLeadIdInputs) {
      const inputElement = input as HTMLInputElement;
      if (inputElement.value?.trim()) return inputElement.value.trim();
    }
    const allInputs = document.querySelectorAll('input[type="hidden"]');
    for (const input of allInputs) {
      const inputElement = input as HTMLInputElement;
      const value = inputElement.value?.trim();
      if (value && /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i.test(value)) return value;
    }
    return '';
  };

  // Helper function to get TrustedForm certificate URL
  const getTrustedFormCert = (): string => {
    if (detectedTrustedFormCert) return detectedTrustedFormCert;
    const tfElement = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
    return tfElement?.value || '';
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const allParams: { [key: string]: string } = {};

    params.forEach((value, key) => {
      if (key !== 'step' && key !== 'ld') {
        allParams[key] = value;
      }
    });

    setQueryParams(allParams);

    const leadData = decodeLeadData(params);
    if (leadData) {
      setPrefilledData(leadData);
      if (leadData.first_name) setAnswers(prev => ({ ...prev, first_name: leadData.first_name }));
      if (leadData.last_name) setAnswers(prev => ({ ...prev, last_name: leadData.last_name }));
      if (leadData.phone_number) setAnswers(prev => ({ ...prev, phone_number: leadData.phone_number }));
      if (leadData.email) setAnswers(prev => ({ ...prev, email: leadData.email }));
      if (leadData.property_address) setAnswers(prev => ({ ...prev, property_address: leadData.property_address }));
      if (leadData.city) setAnswers(prev => ({ ...prev, city: leadData.city }));
      if (leadData.state) setAnswers(prev => ({ ...prev, state: leadData.state }));
      if (leadData.zip_code) setAnswers(prev => ({ ...prev, zip_code: leadData.zip_code }));
      if (leadData.home_owner) setAnswers(prev => ({ ...prev, home_owner: leadData.home_owner }));

      let stepsToSkip = 0;
      if (hasAddressInfo(leadData)) stepsToSkip++;
      if (hasContactInfo(leadData)) stepsToSkip++;
      setActualTotalSteps(TOTAL_STEPS - stepsToSkip);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= TOTAL_STEPS) {
        setCurrentStep(stepNumber);
      }
    }
  }, [location.search]);

  const updateStep = useCallback((newStep: number) => {
    setCurrentStep(newStep);
    const params = new URLSearchParams(location.search);
    params.set('step', newStep.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  }, [location.search, navigate, location.pathname]);

  const handleAnswer = useCallback((field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (field === 'step') {
      updateStep(value);
    }
  }, [updateStep]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const cleanedPhone = answers.phone_number?.replace(/\D/g, '') || '';
    const leadidToken = getLeadIdToken();
    const trustedFormCert = getTrustedFormCert();

    const payload = {
      // Contact info
      first_name: answers.first_name || '',
      last_name: answers.last_name || '',
      phone: cleanedPhone,
      email: answers.email || '',
      // Address
      address: answers.property_address || '',
      city: answers.city || answers.manual_city || '',
      state: answers.state || answers.manual_state || '',
      zip_code: answers.zip_code || answers.manual_zip || '',
      // Service-specific fields (backend extracts into service_data)
      service: answers.service,
      home_owner: answers.home_owner || 'Yes',
      // Compliance fields
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent,
      tcpa_text: 'By clicking "Get My Free Quote" below, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: leadidToken,  // Jornaya LeadID token
      trustedform_cert_url: trustedFormCert,  // TrustedForm certificate URL
      // Metadata
      query_parameters: queryParams,
      original_lead_id: prefilledData?.lead_id
    };

    try {
      const result = await submitHomeServicesLead(payload, 'kitchen');

      if (result.success) {
        setIsSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit your request. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error submitting kitchen lead:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        // First check home_owner if pre-filled, skip to service question
        if (prefilledData?.home_owner) {
          // Home owner already known, show service selection
          return (
            <Step1
              answers={answers}
              handleAnswer={handleAnswer}
              onNext={() => handleAnswer('step', 2)}
            />
          );
        }
        return (
          <HomeOwnerStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 2)}
          />
        );
      case 2:
        // Service selection (if home_owner was asked first)
        if (!prefilledData?.home_owner && !answers.service) {
          return (
            <Step1
              answers={answers}
              handleAnswer={handleAnswer}
              onNext={() => handleAnswer('step', 3)}
            />
          );
        }
        // If home_owner was pre-filled, this is address step
        if (hasAddressInfo(prefilledData)) {
          handleAnswer('step', 3);
          return null;
        }
        return (
          <AddressStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 3)}
          />
        );
      case 3:
        if (hasAddressInfo(prefilledData)) {
          handleAnswer('step', 4);
          return null;
        }
        return (
          <AddressStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 4)}
          />
        );
      case 4:
        if (hasContactInfo(prefilledData)) {
          handleSubmit();
          return null;
        }
        return (
          <ContactInfoStep
            answers={answers}
            handleAnswer={handleAnswer}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            title="Get Your Free Kitchen Remodel Quote!"
            buttonText="Get My Free Quote"
          />
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <SuccessScreen
        title="Thank You!"
        message="Your kitchen remodel quote request has been received. A qualified kitchen specialist in your area will contact you shortly."
        serviceName="kitchen remodeling"
      />
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hidden Jornaya LeadID token field */}
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      {/* Hidden TrustedForm certificate URL field - TrustedForm will populate this */}
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />

      <header className="border-b border-border/60 bg-white sticky top-0 z-50 shadow-custom-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-center">
          <a href="/" className="flex flex-col items-center gap-1">
            <img src="/FOC_less_logo.svg" alt="Family Owned Contractors" className="h-8 sm:h-10 w-auto" />
              <img src="/FOC_name_logo.svg" alt="Family Owned Contractors" className="h-4 sm:h-6 w-auto" />
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={actualTotalSteps} />
          {renderCurrentStep()}
          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />
        </div>
      </div>
    </form>
  );
}
