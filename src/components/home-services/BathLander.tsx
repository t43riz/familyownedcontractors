/**
 * Spec-Compliant Bath Remodel Landing Page
 * Following HOME_SERVICES_LANDING_PAGE_SPEC.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Bath, Home, Layers, Wrench } from 'lucide-react';
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

const TOTAL_STEPS = 6;  // Reduced: property_type is now hardcoded to Residential

const propertyTypeOptions: OptionItem[] = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' }
];

// API spec values: single_family, townhome, condo, mobile
const homeTypeOptions: OptionItem[] = [
  { label: 'Single Family', value: 'single_family' },
  { label: 'Townhome', value: 'townhome' },
  { label: 'Condo', value: 'condo' },
  { label: 'Mobile Home', value: 'mobile' }
];

// API spec values: bath_to_shower, shower_upgrade, bathtub_upgrade, complete_remodel, walkin_tub
const remodelTypeOptions: OptionItem[] = [
  { label: 'Complete Remodel', value: 'complete_remodel' },
  { label: 'Tub to Shower Conversion', value: 'bath_to_shower' },
  { label: 'Shower Upgrade', value: 'shower_upgrade' },
  { label: 'Bathtub Upgrade', value: 'bathtub_upgrade' },
  { label: 'Walk-in Tub', value: 'walkin_tub' }
];

// API spec only accepts these two values
const serviceOptions: OptionItem[] = [
  { label: 'Bath Remodel (no walls changed)', value: 'Bath Remodel no walls added or removed' },
  { label: 'Bath Remodel (walls changed)', value: 'Bath Remodel remove or add walls' }
];

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Step 1: Property Type
const Step1 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Home className="h-8 w-8 text-white" />}
      iconColor="from-blue-500 to-blue-600"
      title="Property Type"
      subtitle="Is this a residential or commercial property?"
    />

    <div className="space-y-2 mb-6">
      {propertyTypeOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.property_type === option.value}
          onClick={() => {
            handleAnswer('property_type', option.value);
            handleAnswer('step', 2);
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// Step 2: Home Type
const Step2 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Layers className="h-8 w-8 text-white" />}
      iconColor="from-green-500 to-green-600"
      title="What Type of Home?"
      subtitle="Select your home type"
    />

    <div className="space-y-2 mb-6">
      {homeTypeOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.home_type === option.value}
          onClick={() => {
            handleAnswer('home_type', option.value);
            handleAnswer('step', 3);
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// Step 3: Remodel Type
const Step3 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Wrench className="h-8 w-8 text-white" />}
      iconColor="from-purple-500 to-purple-600"
      title="What Type of Remodel?"
      subtitle="What best describes your project?"
    />

    <div className="space-y-2 mb-6">
      {remodelTypeOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.remodel_type === option.value}
          onClick={() => {
            handleAnswer('remodel_type', option.value);
            handleAnswer('step', 4);
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// Step 4: Service
const Step4 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Bath className="h-8 w-8 text-white" />}
      iconColor="from-cyan-500 to-cyan-600"
      title="What Service Do You Need?"
      subtitle="Select the specific service"
    />

    <div className="space-y-2 mb-6">
      {serviceOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.service === option.value}
          onClick={() => {
            handleAnswer('service', option.value);
            handleAnswer('step', 5);
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

export default function BathLander() {
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
      address: answers.property_address || '',
      city: answers.city || answers.manual_city || '',
      state: answers.state || answers.manual_state || '',
      zip_code: answers.zip_code || answers.manual_zip || '',
      // Service-specific fields (backend extracts into service_data)
      property_type: 'Residential',  // Hardcoded - always residential
      home_type: answers.home_type,
      remodel_type: answers.remodel_type,
      service: answers.service,
      home_owner: answers.home_owner || 'Yes',
      // Tracking fields
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent,
      tcpa_text: 'By submitting, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: leadidToken,  // Jornaya LeadID token
      trustedform_cert_url: trustedFormCert,  // TrustedForm certificate URL
      // Optional tracking
      query_parameters: queryParams,
      original_lead_id: prefilledData?.lead_id
    };

    try {
      const result = await submitHomeServicesLead(payload, 'bath');

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
      console.error('Error submitting bath lead:', error);
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
        // Property type step - auto-skip (hardcoded to Residential)
        handleAnswer('step', 2);
        return null;
      case 2:
        return <Step2 answers={answers} handleAnswer={handleAnswer} />;
      case 3:
        return <Step3 answers={answers} handleAnswer={handleAnswer} />;
      case 4:
        return <Step4 answers={answers} handleAnswer={handleAnswer} />;
      case 5:
        if (prefilledData?.home_owner) {
          handleAnswer('step', 6);
          return null;
        }
        return (
          <HomeOwnerStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 6)}
          />
        );
      case 6:
        if (hasAddressInfo(prefilledData)) {
          handleAnswer('step', 7);
          return null;
        }
        return (
          <AddressStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 7)}
          />
        );
      case 7:
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
            title="Get Your Free Bath Remodel Quote!"
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
        message="Your bath remodel quote request has been received. A qualified bathroom specialist in your area will contact you shortly."
        serviceName="bathroom remodeling"
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
