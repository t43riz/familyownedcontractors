/**
 * Windows Landing Page with 3-Tier Waterfall Routing
 * Same form UI as WindowsLander but uses ping/post -> RTB -> Thumbtack flow
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Square, Wrench, Layers } from 'lucide-react';
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

const TOTAL_STEPS = 7;

const installRepairOptions: OptionItem[] = [
  { label: 'Install New Windows', value: 'Install' },
  { label: 'Replace Windows', value: 'Replace' },
  { label: 'Repair Windows', value: 'Repair' }
];

const productCountOptions: OptionItem[] = [
  { label: '1 Window', value: '1' },
  { label: '2 Windows', value: '2' },
  { label: '3 Windows', value: '3' },
  { label: '4 Windows', value: '4' },
  { label: '5 Windows', value: '5' },
  { label: '6 Windows', value: '6' },
  { label: '7 Windows', value: '7' },
  { label: '8 Windows', value: '8' },
  { label: '9+ Windows', value: '9' }
];

const materialOptions: OptionItem[] = [
  { label: 'Vinyl', value: 'VINYL' },
  { label: 'Wood', value: 'WOOD' },
  { label: 'Aluminum', value: 'ALUMINUM' },
  { label: 'Fiberglass', value: 'FIBERGLASS' },
  { label: 'Composite', value: 'COMPOSITE' },
  { label: 'Metal', value: 'METAL' },
  { label: 'Brick or Stone', value: 'BRICK OR STONE' }
];

const Step1 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader icon={<Wrench className="h-8 w-8 text-white" />} iconColor="from-blue-500 to-blue-600" title="What Do You Need?" subtitle="Select the type of window service" />
    <div className="space-y-2 mb-6">
      {installRepairOptions.map((option) => (
        <OptionButton key={option.value} option={option} isSelected={answers.install_repair === option.value} onClick={() => { handleAnswer('install_repair', option.value); handleAnswer('step', 3); }} />
      ))}
    </div>
    <StepFooter />
  </AnimatedCard>
);

const Step3 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader icon={<Square className="h-8 w-8 text-white" />} iconColor="from-purple-500 to-purple-600" title="How Many Windows?" subtitle="Select the number of windows" />
    <div className="space-y-2 mb-6"><div className="grid grid-cols-3 gap-2">
      {productCountOptions.map((option) => (
        <OptionButton key={option.value} option={option} isSelected={answers.product_count === option.value} onClick={() => { handleAnswer('product_count', option.value); handleAnswer('step', 4); }} size="compact" />
      ))}
    </div></div>
    <StepFooter />
  </AnimatedCard>
);

const Step4 = ({ answers, handleAnswer }: { answers: FormAnswers; handleAnswer: (field: string, value: any) => void }) => (
  <AnimatedCard>
    <StepHeader icon={<Layers className="h-8 w-8 text-white" />} iconColor="from-orange-500 to-orange-600" title="Preferred Material" subtitle="What window material would you like?" />
    <div className="space-y-2 mb-6">
      {materialOptions.map((option) => (
        <OptionButton key={option.value} option={option} isSelected={answers.material === option.value} onClick={() => { handleAnswer('material', option.value); handleAnswer('step', 5); }} />
      ))}
    </div>
    <StepFooter />
  </AnimatedCard>
);

export default function WindowsLanderWaterfall() {
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
      install_repair: answers.install_repair,
      product_count: answers.product_count,
      material: answers.material,
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
      const result = await routeLead(payload, 'windows');
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
      case 1: return <Step1 answers={answers} handleAnswer={handleAnswer} />;
      case 2: handleAnswer('step', 3); return null;
      case 3: return <Step3 answers={answers} handleAnswer={handleAnswer} />;
      case 4: return <Step4 answers={answers} handleAnswer={handleAnswer} />;
      case 5:
        if (prefilledData?.home_owner) { handleAnswer('step', 6); return null; }
        return <HomeOwnerStep answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 6)} />;
      case 6:
        if (hasAddressInfo(prefilledData)) { handleAnswer('step', 7); return null; }
        return <AddressStep answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 7)} />;
      case 7:
        if (hasContactInfo(prefilledData)) { handleSubmit(); return null; }
        return <ContactInfoStep answers={answers} handleAnswer={handleAnswer} onSubmit={handleSubmit} isLoading={isLoading} title="Get Your Free Window Quote!" buttonText="Get My Free Quote" />;
      default: return null;
    }
  };

  if (routingResult) {
    return <WaterfallPostSubmission result={routingResult} serviceType="windows" serviceName="window" zipCode={answers.zip_code || answers.manual_zip || ''} />;
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
