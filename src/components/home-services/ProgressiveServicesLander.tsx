/**
 * Progressive Multi-Service Lead Capture Lander
 * - Allows selecting multiple services
 * - Collects base info (contact, address) once
 * - Submits each service IMMEDIATELY after its questions are complete
 * - Maximizes lead capture even with partial form completion
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Home, Layers, Square, Thermometer, UtensilsCrossed, Droplets,
  ChevronRight, CheckCircle, Wrench, HardHat, Fan, Flame,
  DollarSign, Clock, Phone
} from 'lucide-react';
import {
  AnimatedCard,
  ProgressBar,
  StepHeader,
  StepFooter,
  ServiceCard,
  SocialProof,
  OptionButton,
  HomeOwnerStep,
  AddressStep,
  ContactInfoStep,
  ComplianceFooter,
  FormAnswers,
  OptionItem
} from './SharedFormComponents';
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead, ServiceType } from '@/services/homeServicesApi';

// ============================================================================
// SERVICE DEFINITIONS
// ============================================================================

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const services: ServiceOption[] = [
  {
    id: 'roofing',
    title: 'Roofing',
    description: 'Repair, replace, or install a new roof',
    icon: <Home className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'bath',
    title: 'Bath Remodel',
    description: 'Bathroom renovations and conversions',
    icon: <Layers className="h-6 w-6" />,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'windows',
    title: 'Windows',
    description: 'Window installation and replacement',
    icon: <Square className="h-6 w-6" />,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'Heating and cooling systems',
    icon: <Thermometer className="h-6 w-6" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'kitchen',
    title: 'Kitchen Remodel',
    description: 'Kitchen renovations and updates',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Plumbing repairs and installations',
    icon: <Droplets className="h-6 w-6" />,
    color: 'from-blue-500 to-cyan-600'
  }
];

// ============================================================================
// SERVICE-SPECIFIC OPTIONS (API spec aligned)
// ============================================================================

interface ServiceQuestion {
  field: string;
  title: string;
  subtitle: string;
  options: OptionItem[];
  icon: React.ReactNode;
  iconColor: string;
  gridLayout?: boolean;
  dependsOn?: string;
  getOptions?: (answers: FormAnswers) => OptionItem[];
}

interface ServiceConfig {
  questions: ServiceQuestion[];
}

// Roofing - 6 questions: install_repair, roof_type, product_type, funding_source, roof_age, call_time
const roofingConfig: ServiceConfig = {
  questions: [
    {
      field: 'install_repair',
      title: 'What Do You Need?',
      subtitle: 'Select the type of roofing service',
      options: [
        { label: 'Install New Roof', value: 'Install' },
        { label: 'Replace Existing Roof', value: 'Replace' },
        { label: 'Repair Existing Roof', value: 'Repair' }
      ],
      icon: <Wrench className="h-8 w-8 text-white" />,
      iconColor: 'from-blue-500 to-blue-600'
    },
    {
      field: 'roof_type',
      title: 'Current Roof Type',
      subtitle: 'What type of roofing do you have?',
      options: [
        { label: 'Asphalt Shingle', value: 'Asphalt Shingle' },
        { label: 'Metal', value: 'Metal' },
        { label: 'Tile', value: 'Tile' },
        { label: 'Cedar Shake', value: 'Cedar Shake' },
        { label: 'Natural Slate', value: 'Natural Slate' },
        { label: 'Flat/Rolled', value: 'Flat/Rolled' }
      ],
      icon: <Layers className="h-8 w-8 text-white" />,
      iconColor: 'from-purple-500 to-purple-600',
      gridLayout: true
    },
    {
      field: 'product_type',
      title: 'Preferred Material',
      subtitle: 'What roofing material would you like?',
      options: [
        { label: 'Asphalt Shingles', value: 'shingles' },
        { label: 'Metal Roofing', value: 'metal' },
        { label: 'Tile Roofing', value: 'tile' },
        { label: 'Flat Roofing', value: 'flat' },
        { label: 'Wood Roofing', value: 'wood' }
      ],
      icon: <HardHat className="h-8 w-8 text-white" />,
      iconColor: 'from-orange-500 to-orange-600'
    },
    {
      field: 'funding_source',
      title: 'How Will You Pay?',
      subtitle: 'Select your payment method',
      options: [
        { label: 'Insurance Claim', value: 'insurance' },
        { label: 'Paying Cash/Financing', value: 'cash' }
      ],
      icon: <DollarSign className="h-8 w-8 text-white" />,
      iconColor: 'from-green-500 to-green-600'
    },
    {
      field: 'roof_age',
      title: 'How Old Is Your Roof?',
      subtitle: 'Approximate age of current roof',
      options: [
        { label: '0-3 Years', value: 'y_0_3' },
        { label: '4-7 Years', value: 'y_4_7' },
        { label: '8-12 Years', value: 'y_8_12' },
        { label: '13-20 Years', value: 'y_13_20' },
        { label: '21+ Years', value: 'y_21_plus' },
        { label: "Don't Know", value: 'dont_know' }
      ],
      icon: <Clock className="h-8 w-8 text-white" />,
      iconColor: 'from-amber-500 to-amber-600',
      gridLayout: true
    },
    {
      field: 'call_time',
      title: 'Best Time to Call?',
      subtitle: 'When should contractors reach you?',
      options: [
        { label: 'Morning (9am-12pm)', value: 'morning' },
        { label: 'Afternoon (12pm-5pm)', value: 'afternoon' },
        { label: 'Evening (5pm-8pm)', value: 'evening' }
      ],
      icon: <Phone className="h-8 w-8 text-white" />,
      iconColor: 'from-blue-500 to-blue-600'
    }
  ]
};

// Bath - 3 questions
const bathConfig: ServiceConfig = {
  questions: [
    {
      field: 'home_type',
      title: 'What Type of Home?',
      subtitle: 'Select your home type',
      options: [
        { label: 'Single Family', value: 'single_family' },
        { label: 'Townhome', value: 'townhome' },
        { label: 'Condo', value: 'condo' },
        { label: 'Mobile Home', value: 'mobile' }
      ],
      icon: <Home className="h-8 w-8 text-white" />,
      iconColor: 'from-green-500 to-green-600'
    },
    {
      field: 'remodel_type',
      title: 'What Type of Remodel?',
      subtitle: 'What best describes your project?',
      options: [
        { label: 'Complete Remodel', value: 'complete_remodel' },
        { label: 'Tub to Shower Conversion', value: 'bath_to_shower' },
        { label: 'Walk-in Tub', value: 'walkin_tub' },
        { label: 'Shower to Tub Conversion', value: 'shower_to_tub' }
      ],
      icon: <Wrench className="h-8 w-8 text-white" />,
      iconColor: 'from-purple-500 to-purple-600'
    },
    {
      field: 'service',
      title: 'Project Scope',
      subtitle: 'Will walls be modified?',
      options: [
        { label: 'No wall changes', value: 'Bath Remodel no walls added or removed' },
        { label: 'Walls will be changed', value: 'Bath Remodel remove or add walls' }
      ],
      icon: <Layers className="h-8 w-8 text-white" />,
      iconColor: 'from-blue-500 to-blue-600'
    }
  ]
};

// Windows - 3 questions
const windowsConfig: ServiceConfig = {
  questions: [
    {
      field: 'install_repair',
      title: 'What Do You Need?',
      subtitle: 'Select the type of window service',
      options: [
        { label: 'Install New Windows', value: 'Install' },
        { label: 'Replace Windows', value: 'Replace' },
        { label: 'Repair Windows', value: 'Repair' }
      ],
      icon: <Wrench className="h-8 w-8 text-white" />,
      iconColor: 'from-indigo-500 to-indigo-600'
    },
    {
      field: 'product_count',
      title: 'How Many Windows?',
      subtitle: 'Select the number of windows',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' },
        { label: '8', value: '8' },
        { label: '9+', value: '9' }
      ],
      icon: <Square className="h-8 w-8 text-white" />,
      iconColor: 'from-purple-500 to-purple-600',
      gridLayout: true
    },
    {
      field: 'material',
      title: 'Preferred Material',
      subtitle: 'What window material would you like?',
      options: [
        { label: 'Vinyl', value: 'VINYL' },
        { label: 'Wood', value: 'WOOD' },
        { label: 'Aluminum', value: 'ALUMINUM' },
        { label: 'Fiberglass', value: 'FIBERGLASS' },
        { label: 'Composite', value: 'COMPOSITE' }
      ],
      icon: <Layers className="h-8 w-8 text-white" />,
      iconColor: 'from-orange-500 to-orange-600'
    }
  ]
};

// HVAC - 3 questions (service auto-derived by backend)
const hvacConfig: ServiceConfig = {
  questions: [
    {
      field: 'air_type',
      title: 'System Type',
      subtitle: 'What type of HVAC system do you need help with?',
      options: [
        { label: 'Cooling (AC)', value: 'Cooling' },
        { label: 'Heating', value: 'Heating' },
        { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
      ],
      icon: <Thermometer className="h-8 w-8 text-white" />,
      iconColor: 'from-red-500 to-orange-500'
    },
    {
      field: 'air_sub_type',
      title: 'Specific System',
      subtitle: 'What type of system do you have or want?',
      options: [], // Dynamic based on air_type
      icon: <Fan className="h-8 w-8 text-white" />,
      iconColor: 'from-cyan-500 to-blue-500',
      dependsOn: 'air_type',
      getOptions: (answers: FormAnswers) => {
        const airType = answers.hvac_air_type;
        if (airType === 'Heating') {
          return [
            { label: 'Gas Furnace', value: 'Gas Furnace' },
            { label: 'Electric Furnace', value: 'Electric Furnace' },
            { label: 'Boiler', value: 'Boiler' },
            { label: 'Heat Pump', value: 'Heat Pump' }
          ];
        } else if (airType === 'Heating and Cooling') {
          return [
            { label: 'Central Air + Furnace', value: 'Central Air' },
            { label: 'Heat Pump', value: 'Heat Pump' }
          ];
        }
        // Default: Cooling
        return [
          { label: 'Central Air', value: 'Central Air' },
          { label: 'Heat Pump', value: 'Heat Pump' }
        ];
      }
    },
    {
      field: 'project_type',
      title: 'What Do You Need?',
      subtitle: 'Select the type of HVAC service',
      options: [
        { label: 'Install New Unit', value: 'Install' },
        { label: 'Replace Existing Unit', value: 'Replace' },
        { label: 'Repair', value: 'Repair' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Cleaning', value: 'Cleaning' }
      ],
      icon: <Wrench className="h-8 w-8 text-white" />,
      iconColor: 'from-green-500 to-green-600'
    }
  ]
};

// Kitchen - 1 question
const kitchenConfig: ServiceConfig = {
  questions: [
    {
      field: 'service',
      title: 'Kitchen Remodel Type',
      subtitle: 'Select the scope of your project',
      options: [
        { label: 'No wall changes', value: 'Kitchen Remodel no walls added or removed' },
        { label: 'Walls will be changed', value: 'Kitchen Remodel remove or add walls' }
      ],
      icon: <UtensilsCrossed className="h-8 w-8 text-white" />,
      iconColor: 'from-amber-500 to-orange-600'
    }
  ]
};

// Plumbing - 1 question
const plumbingConfig: ServiceConfig = {
  questions: [
    {
      field: 'service',
      title: 'Plumbing Service Needed',
      subtitle: 'Select the service that best fits your needs',
      options: [
        { label: 'Plumbing Repair', value: 'Plumbing Repair' },
        { label: 'Plumbing Install', value: 'Plumbing Install' },
        { label: 'Drain Cleaning', value: 'Drain Cleaning' },
        { label: 'Water Heater Repair', value: 'Water Heater Repair' },
        { label: 'Water Heater Replacement', value: 'Water Heater Replacement' },
        { label: 'Pipe Repair', value: 'Pipe Repair' },
        { label: 'Emergency Plumbing', value: 'Emergency Plumbing' }
      ],
      icon: <Droplets className="h-8 w-8 text-white" />,
      iconColor: 'from-blue-500 to-cyan-600'
    }
  ]
};

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  roofing: roofingConfig,
  bath: bathConfig,
  windows: windowsConfig,
  hvac: hvacConfig,
  kitchen: kitchenConfig,
  plumbing: plumbingConfig
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type Phase = 'select' | 'home_owner' | 'address' | 'contact' | 'service_questions' | 'success';

export default function ProgressiveServicesLander() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Core state
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submittedServices, setSubmittedServices] = useState<string[]>([]);
  const [failedServices, setFailedServices] = useState<string[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<LeadData | null>(null);
  const [queryParams, setQueryParams] = useState<{ [key: string]: string }>({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Compliance tokens
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

  // Helper functions for compliance tokens
  const getLeadIdToken = (): string => {
    if (detectedLeadId) return detectedLeadId;
    const leadidTokenElement = document.getElementById('leadid_token') as HTMLInputElement;
    if (leadidTokenElement?.value) return leadidTokenElement.value;
    const allLeadIdInputs = document.querySelectorAll('input[name*="leadid"], input[id*="leadid"]');
    for (const input of allLeadIdInputs) {
      const inputElement = input as HTMLInputElement;
      if (inputElement.value?.trim()) return inputElement.value.trim();
    }
    return '';
  };

  const getTrustedFormCert = (): string => {
    if (detectedTrustedFormCert) return detectedTrustedFormCert;
    const tfElement = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
    return tfElement?.value || '';
  };

  // Extract publisher_id from query params (pid) or default to "house"
  const getPublisherId = () => {
    return queryParams.pid || "house";
  };

  // Load prefilled data and pre-selected services from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const allParams: { [key: string]: string } = {};

    params.forEach((value, key) => {
      if (key !== 'ld' && key !== 'services') {
        allParams[key] = value;
      }
    });
    setQueryParams(allParams);

    // Check for pre-selected services from URL
    const servicesParam = params.get('services');
    if (servicesParam) {
      const validServices = ['roofing', 'bath', 'windows', 'hvac', 'kitchen', 'plumbing'];
      const preSelectedServices = servicesParam.split(',').filter(s => validServices.includes(s));
      if (preSelectedServices.length > 0) {
        setSelectedServices(preSelectedServices);
      }
    }

    const leadData = decodeLeadData(params);
    if (leadData) {
      setPrefilledData(leadData);
      // Pre-fill answers from handoff data
      if (leadData.first_name) setAnswers(prev => ({ ...prev, first_name: leadData.first_name }));
      if (leadData.last_name) setAnswers(prev => ({ ...prev, last_name: leadData.last_name }));
      if (leadData.phone_number) setAnswers(prev => ({ ...prev, phone_number: leadData.phone_number }));
      if (leadData.email) setAnswers(prev => ({ ...prev, email: leadData.email }));
      if (leadData.property_address) setAnswers(prev => ({ ...prev, property_address: leadData.property_address }));
      if (leadData.city) setAnswers(prev => ({ ...prev, city: leadData.city }));
      if (leadData.state) setAnswers(prev => ({ ...prev, state: leadData.state }));
      if (leadData.zip_code) setAnswers(prev => ({ ...prev, zip_code: leadData.zip_code }));
      if (leadData.home_owner) setAnswers(prev => ({ ...prev, home_owner: leadData.home_owner }));
    }

    // Mark initialization complete
    setIsInitializing(false);
  }, [location.search]);

  const handleAnswer = useCallback((field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Build common data for API submission
  const buildCommonData = () => {
    const cleanedPhone = answers.phone_number?.replace(/\D/g, '') || '';
    // Prefer compliance tokens from handoff (prefilledData), fallback to local capture
    const leadidToken = prefilledData?.jornaya_leadid || getLeadIdToken();
    const trustedFormCert = prefilledData?.trustedform_cert_url || getTrustedFormCert();

    return {
      first_name: answers.first_name || '',
      last_name: answers.last_name || '',
      phone: cleanedPhone,
      email: answers.email || '',
      address: answers.property_address || '',
      city: answers.city || answers.manual_city || '',
      state: answers.state || answers.manual_state || '',
      zip_code: answers.zip_code || answers.manual_zip || '',
      home_owner: answers.home_owner || 'Yes',
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent,
      tcpa_text: 'By clicking "Get My Cash Offer" I consent and provide my electronic signature as express written consent for SellingProperty.net, its partners, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding a cash offer for my property and/or home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry.',
      jornaya_leadid: leadidToken,
      trustedform_cert_url: trustedFormCert,
      query_parameters: queryParams,
      publisher_id: getPublisherId()
    };
  };

  // Build service-specific data
  const buildServiceData = (serviceId: string) => {
    const serviceData: Record<string, any> = {};
    serviceData.property_type = 'Residential'; // Always residential

    switch (serviceId) {
      case 'roofing':
        serviceData.install_repair = answers.roofing_install_repair;
        serviceData.roof_type = answers.roofing_roof_type;
        serviceData.product_type = answers.roofing_product_type;
        serviceData.funding_source = answers.roofing_funding_source;
        serviceData.roof_age = answers.roofing_roof_age;
        serviceData.call_time = answers.roofing_call_time;
        serviceData.damage_cause = 'age'; // Default
        break;
      case 'bath':
        serviceData.home_type = answers.bath_home_type;
        serviceData.remodel_type = answers.bath_remodel_type;
        serviceData.service = answers.bath_service;
        break;
      case 'windows':
        serviceData.install_repair = answers.windows_install_repair;
        serviceData.product_count = answers.windows_product_count;
        serviceData.material = answers.windows_material;
        break;
      case 'hvac':
        serviceData.air_type = answers.hvac_air_type;
        serviceData.air_sub_type = answers.hvac_air_sub_type;
        serviceData.project_type = answers.hvac_project_type;
        // Derive service from project_type
        serviceData.service = `HVAC ${answers.hvac_project_type || 'Install'}`;
        break;
      case 'kitchen':
        serviceData.service = answers.kitchen_service;
        break;
      case 'plumbing':
        serviceData.service = answers.plumbing_service;
        break;
    }

    return serviceData;
  };

  // Submit a single service
  const submitService = async (serviceId: string) => {
    if (submittedServices.includes(serviceId)) return;

    const commonData = buildCommonData();
    const serviceData = buildServiceData(serviceId);
    const payload = { ...commonData, ...serviceData };

    try {
      const result = await submitHomeServicesLead(payload, serviceId as ServiceType);

      if (result.success) {
        setSubmittedServices(prev => [...prev, serviceId]);
      } else {
        setFailedServices(prev => [...prev, serviceId]);
        console.error(`Failed to submit ${serviceId}:`, result.error);
      }
    } catch (error) {
      setFailedServices(prev => [...prev, serviceId]);
      console.error(`Error submitting ${serviceId}:`, error);
    }
  };

  // Handle continuing from service selection
  const handleContinueFromSelection = useCallback(() => {
    if (selectedServices.length === 0) return;

    // Determine which base info steps to skip
    const hasHomeOwner = prefilledData?.home_owner || answers.home_owner;
    const hasAddress = hasAddressInfo(prefilledData);
    const hasContact = hasContactInfo(prefilledData);

    if (!hasHomeOwner) {
      setPhase('home_owner');
    } else if (!hasAddress) {
      setPhase('address');
    } else if (!hasContact) {
      setPhase('contact');
    } else {
      // All base info present, go straight to service questions
      setPhase('service_questions');
    }
  }, [selectedServices, prefilledData, answers.home_owner]);

  // Auto-advance past selection when services are pre-selected from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const servicesParam = params.get('services');

    // Only auto-advance if services came from URL AND we have prefilled data AND we're still in select phase
    if (servicesParam && selectedServices.length > 0 && phase === 'select' && prefilledData && !isInitializing) {
      handleContinueFromSelection();
    }
  }, [selectedServices, phase, prefilledData, isInitializing, handleContinueFromSelection, location.search]);

  // Handle moving to next phase after base info
  const handleNextBaseInfoStep = () => {
    const hasAddress = hasAddressInfo(prefilledData) || (answers.property_address && answers.city && answers.state && answers.zip_code);
    const hasContact = hasContactInfo(prefilledData) || (answers.first_name && answers.last_name && answers.phone_number && answers.email);

    if (phase === 'home_owner') {
      if (!hasAddress && !hasAddressInfo(prefilledData)) {
        setPhase('address');
      } else if (!hasContact && !hasContactInfo(prefilledData)) {
        setPhase('contact');
      } else {
        setPhase('service_questions');
      }
    } else if (phase === 'address') {
      if (!hasContact && !hasContactInfo(prefilledData)) {
        setPhase('contact');
      } else {
        setPhase('service_questions');
      }
    } else if (phase === 'contact') {
      setPhase('service_questions');
    }
  };

  // Handle answering a service question
  const handleServiceQuestionAnswer = async (value: string) => {
    const currentService = selectedServices[currentServiceIndex];
    const config = SERVICE_CONFIGS[currentService];
    const currentQuestion = config.questions[currentQuestionIndex];
    const answerKey = `${currentService}_${currentQuestion.field}`;

    // Save answer
    setAnswers(prev => ({ ...prev, [answerKey]: value }));

    const isLastQuestionForService = currentQuestionIndex === config.questions.length - 1;

    if (isLastQuestionForService) {
      // Submit this service immediately (with the new answer included)
      const updatedAnswers = { ...answers, [answerKey]: value };

      // Build and submit with updated answers
      const commonData = buildCommonData();
      const serviceData: Record<string, any> = { property_type: 'Residential' };

      // Re-build service data with updated answers
      switch (currentService) {
        case 'roofing':
          serviceData.install_repair = currentQuestion.field === 'install_repair' ? value : updatedAnswers.roofing_install_repair;
          serviceData.roof_type = currentQuestion.field === 'roof_type' ? value : updatedAnswers.roofing_roof_type;
          serviceData.product_type = currentQuestion.field === 'product_type' ? value : updatedAnswers.roofing_product_type;
          serviceData.funding_source = currentQuestion.field === 'funding_source' ? value : updatedAnswers.roofing_funding_source;
          serviceData.roof_age = currentQuestion.field === 'roof_age' ? value : updatedAnswers.roofing_roof_age;
          serviceData.call_time = currentQuestion.field === 'call_time' ? value : updatedAnswers.roofing_call_time;
          serviceData.damage_cause = 'age'; // Default
          break;
        case 'bath':
          serviceData.home_type = currentQuestion.field === 'home_type' ? value : updatedAnswers.bath_home_type;
          serviceData.remodel_type = currentQuestion.field === 'remodel_type' ? value : updatedAnswers.bath_remodel_type;
          serviceData.service = currentQuestion.field === 'service' ? value : updatedAnswers.bath_service;
          break;
        case 'windows':
          serviceData.install_repair = currentQuestion.field === 'install_repair' ? value : updatedAnswers.windows_install_repair;
          serviceData.product_count = currentQuestion.field === 'product_count' ? value : updatedAnswers.windows_product_count;
          serviceData.material = currentQuestion.field === 'material' ? value : updatedAnswers.windows_material;
          break;
        case 'hvac':
          serviceData.air_type = currentQuestion.field === 'air_type' ? value : updatedAnswers.hvac_air_type;
          serviceData.air_sub_type = currentQuestion.field === 'air_sub_type' ? value : updatedAnswers.hvac_air_sub_type;
          const hvacProjectType = currentQuestion.field === 'project_type' ? value : updatedAnswers.hvac_project_type;
          serviceData.project_type = hvacProjectType;
          // Derive service from project_type
          serviceData.service = `HVAC ${hvacProjectType || 'Install'}`;
          break;
        case 'kitchen':
          serviceData.service = value;
          break;
        case 'plumbing':
          serviceData.service = value;
          break;
      }

      const payload = { ...commonData, ...serviceData };

      try {
        const result = await submitHomeServicesLead(payload, currentService as ServiceType);
        if (result.success) {
          setSubmittedServices(prev => [...prev, currentService]);
        } else {
          setFailedServices(prev => [...prev, currentService]);
        }
      } catch (error) {
        setFailedServices(prev => [...prev, currentService]);
      }

      // Move to next service or success
      if (currentServiceIndex < selectedServices.length - 1) {
        setCurrentServiceIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        setPhase('success');
      }
    } else {
      // Next question for same service
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (phase === 'select') return { current: 1, total: 10 };

    let baseSteps = 1; // Selection step
    if (!prefilledData?.home_owner) baseSteps++;
    if (!hasAddressInfo(prefilledData)) baseSteps++;
    if (!hasContactInfo(prefilledData)) baseSteps++;

    let totalServiceSteps = 0;
    selectedServices.forEach(serviceId => {
      totalServiceSteps += SERVICE_CONFIGS[serviceId]?.questions.length || 0;
    });

    const total = baseSteps + totalServiceSteps;

    let current = 1;
    if (phase === 'home_owner') current = 2;
    else if (phase === 'address') current = prefilledData?.home_owner ? 2 : 3;
    else if (phase === 'contact') {
      current = 1;
      if (!prefilledData?.home_owner) current++;
      if (!hasAddressInfo(prefilledData)) current++;
      current++;
    }
    else if (phase === 'service_questions') {
      current = baseSteps;
      for (let i = 0; i < currentServiceIndex; i++) {
        current += SERVICE_CONFIGS[selectedServices[i]]?.questions.length || 0;
      }
      current += currentQuestionIndex + 1;
    }
    else if (phase === 'success') current = total;

    return { current, total };
  };

  // Render service selection
  const renderServiceSelection = () => (
    <AnimatedCard>
      <StepHeader
        icon={<Home className="h-8 w-8 text-white" />}
        iconColor="from-primary to-primary/80"
        title="Get Free Home Service Quotes"
        subtitle="Select all services you need - we'll match you with top local pros"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            icon={service.icon}
            title={service.title}
            description={service.description}
            isSelected={selectedServices.includes(service.id)}
            onClick={() => toggleService(service.id)}
          />
        ))}
      </div>

      {selectedServices.length > 0 && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
          <p className="text-sm text-green-800 font-medium">
            {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <Button
        onClick={handleContinueFromSelection}
        disabled={selectedServices.length === 0}
        className="w-full py-6 text-lg font-semibold"
      >
        Continue <ChevronRight className="ml-2 h-5 w-5" />
      </Button>

      <StepFooter />
    </AnimatedCard>
  );

  // Render service question
  const renderServiceQuestion = () => {
    const currentService = selectedServices[currentServiceIndex];
    const config = SERVICE_CONFIGS[currentService];
    const question = config.questions[currentQuestionIndex];
    const serviceInfo = services.find(s => s.id === currentService);

    // Get options (may be dynamic)
    const options = question.getOptions ? question.getOptions(answers) : question.options;

    return (
      <AnimatedCard>
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">
            {serviceInfo?.title}
          </span>
          <span>
            Question {currentQuestionIndex + 1} of {config.questions.length}
          </span>
        </div>

        <StepHeader
          icon={question.icon}
          iconColor={question.iconColor}
          title={question.title}
          subtitle={question.subtitle}
        />

        <div className={`space-y-2 mb-6 ${question.gridLayout ? 'grid grid-cols-2 gap-2 space-y-0' : ''}`}>
          {options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={answers[`${currentService}_${question.field}`] === option.value}
              onClick={() => handleServiceQuestionAnswer(option.value)}
              size={question.gridLayout ? 'compact' : 'default'}
            />
          ))}
        </div>

        {submittedServices.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>{submittedServices.length} service{submittedServices.length > 1 ? 's' : ''} submitted</span>
            </div>
          </div>
        )}

        <StepFooter />
      </AnimatedCard>
    );
  };

  // Render success screen
  const renderSuccess = () => {
    const submittedServiceNames = submittedServices.map(id =>
      services.find(s => s.id === id)?.title || id
    );

    const serviceCount = submittedServices.length;
    const isMultiple = serviceCount > 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <AnimatedCard className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            🎉 Congratulations! Your {isMultiple ? 'Requests Are' : 'Request Is'} Confirmed!
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            You've successfully taken the first step toward getting your {isMultiple ? 'projects' : 'project'} handled by trusted local experts.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {submittedServiceNames.map((name, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {name}
              </span>
            ))}
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-orange-300 mb-6 shadow-lg">
            <h3 className="font-bold text-orange-900 mb-2">📞 Don't Miss the Call{isMultiple ? 's' : ''}</h3>
            <p className="text-sm text-orange-800">
              Local contractors will call within 15–30 minutes.<br />
              👉 Keep your phone nearby and answer.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">🔍 What Happens Next</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>📝 We review your details (in progress)</li>
              <li>📞 You receive {isMultiple ? 'calls' : 'a quick call'} to confirm your needs</li>
              <li>🏠 Get your free {isMultiple ? 'quotes' : 'quote'} — no obligation</li>
            </ul>
          </div>
          {failedServices.length > 0 && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <p className="text-sm text-red-800">
                ⚠️ Note: {failedServices.length} service{failedServices.length > 1 ? 's' : ''} could not be submitted. You may try again later.
              </p>
            </div>
          )}
        </AnimatedCard>
      </div>
    );
  };

  // Main render
  if (phase === 'success') {
    return renderSuccess();
  }

  const progress = calculateProgress();

  // Show loading state while initializing if we have pre-selected services from URL
  const params = new URLSearchParams(location.search);
  const hasUrlServices = params.get('services');

  if (isInitializing && hasUrlServices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hidden Jornaya LeadID token field */}
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      {/* Hidden TrustedForm certificate URL field */}
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />

      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl font-bold text-primary">Get Free Home Service Quotes</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={progress.current} totalSteps={progress.total} />

          {phase === 'select' && renderServiceSelection()}

          {phase === 'home_owner' && (
            <HomeOwnerStep
              answers={answers}
              handleAnswer={handleAnswer}
              onNext={handleNextBaseInfoStep}
            />
          )}

          {phase === 'address' && (
            <AddressStep
              answers={answers}
              handleAnswer={handleAnswer}
              onNext={handleNextBaseInfoStep}
            />
          )}

          {phase === 'contact' && (
            <ContactInfoStep
              answers={answers}
              handleAnswer={handleAnswer}
              onSubmit={handleNextBaseInfoStep}
              isLoading={false}
              title="Almost There!"
              subtitle="Enter your contact info to get your free quotes"
              buttonText="Continue to Service Details"
            />
          )}

          {phase === 'service_questions' && renderServiceQuestion()}

          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />
        </div>
      </div>
    </form>
  );
}
