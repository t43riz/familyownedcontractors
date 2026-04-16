/**
 * HVAC Landing Page with 3-Tier Waterfall Routing
 * Same form UI as HVACLander but uses ping/post -> RTB -> Thumbtack flow
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
  SocialProof,
  ComplianceFooter,
  FormAnswers,
  OptionItem
} from './SharedFormComponents';
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { routeLead, type RoutingResult } from '@/services/leadRoutingApi';
import WaterfallPostSubmission from './WaterfallPostSubmission';

const TOTAL_STEPS = 8;

const airTypeOptions: OptionItem[] = [
  { label: 'Cooling (AC)', value: 'Cooling' },
  { label: 'Heating', value: 'Heating' },
  { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
];

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

// Step components
const Step2 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader icon={<Thermometer className="h-8 w-8 text-white" />} iconColor="from-orange-500 to-red-500" title="System Type" subtitle="What type of HVAC system do you need help with?" />
    <div className="space-y-2 mb-6">
      {airTypeOptions.map((option) => (
        <OptionButton key={option.value} option={option} isSelected={answers.air_type === option.value} onClick={() => { handleAnswer('air_type', option.value); handleAnswer('step', 3); }} />
      ))}
    </div>
    <StepFooter />
  </AnimatedCard>
);

const Step3 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => {
  const options = airSubTypeOptions[answers.air_type || 'Cooling'] || airSubTypeOptions.Cooling;
  return (
    <AnimatedCard>
      <StepHeader icon={answers.air_type === 'Heating' ? <Flame className="h-8 w-8 text-white" /> : <Fan className="h-8 w-8 text-white" />} iconColor={answers.air_type === 'Heating' ? "from-red-500 to-orange-500" : "from-cyan-500 to-blue-500"} title="Specific System" subtitle="What type of system do you have or want?" />
      <div className="space-y-2 mb-6">
        {options.map((option) => (
          <OptionButton key={option.value} option={option} isSelected={answers.air_sub_type === option.value} onClick={() => { handleAnswer('air_sub_type', option.value); handleAnswer('step', 4); }} />
        ))}
      </div>
      <StepFooter />
    </AnimatedCard>
  );
};

const Step4 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader icon={<Wrench className="h-8 w-8 text-white" />} iconColor="from-green-500 to-green-600" title="What Do You Need?" subtitle="Select the type of service" />
    <div className="space-y-2 mb-6">
      {projectTypeOptions.map((option) => (
        <OptionButton key={option.value} option={option} isSelected={answers.project_type === option.value} onClick={() => { handleAnswer('project_type', option.value); handleAnswer('step', 5); }} />
      ))}
    </div>
    <StepFooter />
  </AnimatedCard>
);

const Step5 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => {
  const options = serviceOptions[answers.project_type || 'Repair'] || serviceOptions.Repair;
  return (
    <AnimatedCard>
      <StepHeader icon={<Wrench className="h-8 w-8 text-white" />} iconColor="from-purple-500 to-purple-600" title="Service Needed" subtitle="Select the specific service you need" />
      <div className="space-y-2 mb-6">
        {options.map((option) => (
          <OptionButton key={option.value} option={option} isSelected={answers.service === option.value} onClick={() => { handleAnswer('service', option.value); handleAnswer('step', 6); }} />
        ))}
      </div>
      <StepFooter />
    </AnimatedCard>
  );
};

export default function HVACLanderWaterfall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<LeadData | null>(null);
  const [queryParams, setQueryParams] = useState<{ [key: string]: string }>({});
  const [detectedLeadId, setDetectedLeadId] = useState<string>('');
  const [detectedTrustedFormCert, setDetectedTrustedFormCert] = useState<string>('');
  const [actualTotalSteps, setActualTotalSteps] = useState(TOTAL_STEPS);

  useEffect(() => {
    const monitorTokens = () => {
      const leadIdElement = document.getElementById('leadid_token') as HTMLInputElement;
      if (leadIdElement?.value) setDetectedLeadId(leadIdElement.value);
      const tfElement = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
      if (tfElement?.value) setDetectedTrustedFormCert(tfElement.value);
    };
    const interval = setInterval(monitorTokens, 1000);
    monitorTokens();
    setTimeout(monitorTokens, 3000);
    return () => clearInterval(interval);
  }, []);

  const getLeadIdToken = (): string => {
    if (detectedLeadId) return detectedLeadId;
    const el = document.getElementById('leadid_token') as HTMLInputElement;
    if (el?.value) return el.value;
    const all = document.querySelectorAll('input[name*="leadid"], input[id*="leadid"]');
    for (const input of all) {
      const val = (input as HTMLInputElement).value?.trim();
      if (val) return val;
    }
    return '';
  };

  const getTrustedFormCert = (): string => {
    if (detectedTrustedFormCert) return detectedTrustedFormCert;
    const el = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
    return el?.value || '';
  };

  const getPublisherId = () => queryParams.pid || 'house';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const allParams: { [key: string]: string } = {};
    params.forEach((value, key) => {
      if (key !== 'step' && key !== 'ld') allParams[key] = value;
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
      if (stepNumber >= 1 && stepNumber <= TOTAL_STEPS) setCurrentStep(stepNumber);
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
    if (field === 'step') updateStep(value);
  }, [updateStep]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const cleanedPhone = answers.phone_number?.replace(/\D/g, '') || '';

    const payload = {
      first_name: answers.first_name || '',
      last_name: answers.last_name || '',
      phone: cleanedPhone,
      email: answers.email || '',
      address: answers.property_address || '',
      city: answers.city || answers.manual_city || '',
      state: answers.state || answers.manual_state || '',
      zip_code: answers.zip_code || answers.manual_zip || '',
      property_type: 'Residential',
      project_type: answers.project_type,
      air_type: answers.air_type,
      air_sub_type: answers.air_sub_type,
      home_owner: answers.home_owner || 'Yes',
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent,
      tcpa_text: 'By clicking "Get My Free Quote" below, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: getLeadIdToken(),
      trustedform_cert_url: getTrustedFormCert(),
      query_parameters: queryParams,
      publisher_id: getPublisherId(),
      original_lead_id: prefilledData?.lead_id,
    };

    try {
      const result = await routeLead(payload, 'hvac');
      setRoutingResult(result);

      if (result.tier === 'pingpost' && !result.pingpost?.success) {
        toast({ title: 'Error', description: result.pingpost?.error || 'Failed to submit your request.', variant: 'destructive', duration: 5000 });
        setRoutingResult(null);
      }
    } catch (error) {
      console.error('Error in waterfall routing:', error);
      toast({ title: 'Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive', duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: handleAnswer('step', 2); return null;
      case 2: return <Step2 answers={answers} handleAnswer={handleAnswer} />;
      case 3: return <Step3 answers={answers} handleAnswer={handleAnswer} />;
      case 4: return <Step4 answers={answers} handleAnswer={handleAnswer} />;
      case 5: return <Step5 answers={answers} handleAnswer={handleAnswer} />;
      case 6:
        if (prefilledData?.home_owner) { handleAnswer('step', 7); return null; }
        return <HomeOwnerStep answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 7)} />;
      case 7:
        if (hasAddressInfo(prefilledData)) { handleAnswer('step', 8); return null; }
        return <AddressStep answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 8)} />;
      case 8:
        if (hasContactInfo(prefilledData)) { handleSubmit(); return null; }
        return <ContactInfoStep answers={answers} handleAnswer={handleAnswer} onSubmit={handleSubmit} isLoading={isLoading} title="Get Your Free HVAC Quote!" buttonText="Get My Free Quote" />;
      default: return null;
    }
  };

  if (routingResult) {
    return <WaterfallPostSubmission result={routingResult} serviceType="hvac" serviceName="HVAC" zipCode={answers.zip_code || answers.manual_zip || ''} />;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gradient-to-b from-background to-muted">
      <input id="leadid_token" name="universal_leadid" type="hidden" />
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
