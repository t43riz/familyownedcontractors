/**
 * Spec-Compliant HVAC Landing Page
 * Following HOME_SERVICES_LANDING_PAGE_SPEC.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Home, Wrench, Fan, Flame } from 'lucide-react';
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

const TOTAL_STEPS = 7;  // Reduced: property_type is now hardcoded to Residential

const propertyTypeOptions: OptionItem[] = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' }
];

// API spec values: Heating, Cooling, Heating and Cooling
const airTypeOptions: OptionItem[] = [
  { label: 'Cooling (AC)', value: 'Cooling' },
  { label: 'Heating', value: 'Heating' },
  { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
];

// API spec values: Central Air, Heat Pump, Gas Furnace, Propane Furnace, Oil Furnace, Electric Furnace, Boiler, Water Heater
const airSubTypeOptions: { [key: string]: OptionItem[] } = {
  Cooling: [
    { label: 'Central Air', value: 'Central Air' },
    { label: 'Heat Pump', value: 'Heat Pump' }
  ],
  Heating: [
    { label: 'Gas Furnace', value: 'Gas Furnace' },
    { label: 'Electric Furnace', value: 'Electric Furnace' },
    { label: 'Propane Furnace', value: 'Propane Furnace' },
    { label: 'Oil Furnace', value: 'Oil Furnace' },
    { label: 'Boiler', value: 'Boiler' },
    { label: 'Heat Pump', value: 'Heat Pump' }
  ],
  'Heating and Cooling': [
    { label: 'Central Air', value: 'Central Air' },
    { label: 'Heat Pump', value: 'Heat Pump' },
    { label: 'Gas Furnace', value: 'Gas Furnace' },
    { label: 'Electric Furnace', value: 'Electric Furnace' }
  ]
};

// API spec values: New Unit Installed, Install, Replace, Repair, Service, Maintenance, Cleaning, Upgrade
const projectTypeOptions: OptionItem[] = [
  { label: 'Repair', value: 'Repair' },
  { label: 'New Unit Installed', value: 'New Unit Installed' },
  { label: 'Install', value: 'Install' },
  { label: 'Replace', value: 'Replace' },
  { label: 'Service', value: 'Service' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Cleaning', value: 'Cleaning' },
  { label: 'Upgrade', value: 'Upgrade' }
];

// Service options mapped to project_type values
// Note: These are for UI display only - backend auto-derives the actual service field
const serviceOptions: { [key: string]: OptionItem[] } = {
  Repair: [
    { label: 'A/C Repair', value: 'A/C Repair' },
    { label: 'Furnace/Heating System Repair', value: 'Furnace/Heating System Repair' },
    { label: 'Heat Pump Repair', value: 'Heat Pump Repair' },
    { label: 'Boiler Repair', value: 'Boiler Repair' }
  ],
  'New Unit Installed': [
    { label: 'A/C Install', value: 'A/C Install' },
    { label: 'Furnace/Heating System Install', value: 'Furnace/Heating System Install' },
    { label: 'Heat Pump Install', value: 'Heat Pump Install' },
    { label: 'Boiler Install', value: 'Boiler Install' }
  ],
  Install: [
    { label: 'A/C Install', value: 'A/C Install' },
    { label: 'Furnace/Heating System Install', value: 'Furnace/Heating System Install' },
    { label: 'Heat Pump Install', value: 'Heat Pump Install' },
    { label: 'Boiler Install', value: 'Boiler Install' }
  ],
  Replace: [
    { label: 'A/C Replacement', value: 'A/C Replacement' },
    { label: 'Furnace Replacement', value: 'Furnace Replacement' },
    { label: 'Heat Pump Replacement', value: 'Heat Pump Replacement' },
    { label: 'Boiler Replacement', value: 'Boiler Replacement' }
  ],
  Service: [
    { label: 'A/C Service', value: 'A/C Service' },
    { label: 'Furnace Service', value: 'Furnace Service' },
    { label: 'Heat Pump Service', value: 'Heat Pump Service' }
  ],
  Maintenance: [
    { label: 'A/C Maintenance', value: 'A/C Maintenance' },
    { label: 'Furnace Maintenance', value: 'Furnace Maintenance' },
    { label: 'Full System Maintenance', value: 'Full System Maintenance' }
  ],
  Cleaning: [
    { label: 'Duct Cleaning', value: 'Duct Cleaning' },
    { label: 'A/C Cleaning', value: 'A/C Cleaning' },
    { label: 'Furnace Cleaning', value: 'Furnace Cleaning' }
  ],
  Upgrade: [
    { label: 'A/C Upgrade', value: 'A/C Upgrade' },
    { label: 'Furnace Upgrade', value: 'Furnace Upgrade' },
    { label: 'Full System Upgrade', value: 'Full System Upgrade' }
  ]
};

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

// Step 2: System Type (Cooling/Heating/Both)
const Step2 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Thermometer className="h-8 w-8 text-white" />}
      iconColor="from-orange-500 to-red-500"
      title="System Type"
      subtitle="What type of HVAC system do you need help with?"
    />

    <div className="space-y-2 mb-6">
      {airTypeOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.air_type === option.value}
          onClick={() => {
            handleAnswer('air_type', option.value);
            handleAnswer('step', 3);
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// Step 3: Specific System (conditional)
const Step3 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => {
  const options = airSubTypeOptions[answers.air_type || 'Cooling'] || airSubTypeOptions.Cooling;

  return (
    <AnimatedCard>
      <StepHeader
        icon={answers.air_type === 'Heating' ? <Flame className="h-8 w-8 text-white" /> : <Fan className="h-8 w-8 text-white" />}
        iconColor={answers.air_type === 'Heating' ? "from-red-500 to-orange-500" : "from-cyan-500 to-blue-500"}
        title="Specific System"
        subtitle="What type of system do you have or want?"
      />

      <div className="space-y-2 mb-6">
        {options.map((option) => (
          <OptionButton
            key={option.value}
            option={option}
            isSelected={answers.air_sub_type === option.value}
            onClick={() => {
              handleAnswer('air_sub_type', option.value);
              handleAnswer('step', 4);
            }}
          />
        ))}
      </div>

      <StepFooter />
    </AnimatedCard>
  );
};

// Step 4: What do you need?
const Step4 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader
      icon={<Wrench className="h-8 w-8 text-white" />}
      iconColor="from-green-500 to-green-600"
      title="What Do You Need?"
      subtitle="Select the type of service"
    />

    <div className="space-y-2 mb-6">
      {projectTypeOptions.map((option) => (
        <OptionButton
          key={option.value}
          option={option}
          isSelected={answers.project_type === option.value}
          onClick={() => {
            handleAnswer('project_type', option.value);
            handleAnswer('step', 5);
          }}
        />
      ))}
    </div>

    <StepFooter />
  </AnimatedCard>
);

// Step 5: Service Needed (conditional)
const Step5 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => {
  const options = serviceOptions[answers.project_type || 'Repair'] || serviceOptions.Repair;

  return (
    <AnimatedCard>
      <StepHeader
        icon={<Wrench className="h-8 w-8 text-white" />}
        iconColor="from-purple-500 to-purple-600"
        title="Service Needed"
        subtitle="Select the specific service you need"
      />

      <div className="space-y-2 mb-6">
        {options.map((option) => (
          <OptionButton
            key={option.value}
            option={option}
            isSelected={answers.service === option.value}
            onClick={() => {
              handleAnswer('service', option.value);
              handleAnswer('step', 6);
            }}
          />
        ))}
      </div>

      <StepFooter />
    </AnimatedCard>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HVACLander() {
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
      // Note: service field is auto-derived by backend from air_sub_type + project_type
      property_type: 'Residential',  // Hardcoded - always residential
      project_type: answers.project_type,
      air_type: answers.air_type,
      air_sub_type: answers.air_sub_type,
      home_owner: answers.home_owner || 'Yes',
      // Compliance fields
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent,
      tcpa_text: 'By submitting, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: leadidToken,  // Jornaya LeadID token
      trustedform_cert_url: trustedFormCert,  // TrustedForm certificate URL
      // Metadata
      query_parameters: queryParams,
      original_lead_id: prefilledData?.lead_id
    };

    try {
      const result = await submitHomeServicesLead(payload, 'hvac');

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
      console.error('Error submitting HVAC lead:', error);
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
        return <Step5 answers={answers} handleAnswer={handleAnswer} />;
      case 6:
        if (prefilledData?.home_owner) {
          handleAnswer('step', 7);
          return null;
        }
        return (
          <HomeOwnerStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 7)}
          />
        );
      case 7:
        if (hasAddressInfo(prefilledData)) {
          handleAnswer('step', 8);
          return null;
        }
        return (
          <AddressStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={() => handleAnswer('step', 8)}
          />
        );
      case 8:
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
            title="Get Your Free HVAC Quote!"
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
        message="Your HVAC quote request has been received. A qualified HVAC specialist in your area will contact you shortly."
        serviceName="HVAC"
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
