/**
 * Home Services Hub - Multi-Service Selector & Form
 * Supports selecting multiple services and collecting all necessary info
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Home, Layers, Square, Thermometer, UtensilsCrossed, Droplets,
  ChevronRight, CheckCircle, Wrench, HardHat, Fan, Flame
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
  SuccessScreen,
  ComplianceFooter,
  FormAnswers,
  OptionItem
} from './SharedFormComponents';
import { decodeLeadData, buildHandoffUrl, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead, submitMultipleHomeServicesLeads, ServiceType } from '@/services/homeServicesApi';

// ============================================================================
// SERVICE DEFINITIONS
// ============================================================================

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const services: ServiceOption[] = [
  {
    id: 'roofing',
    title: 'Roofing',
    description: 'Repair, replace, or install a new roof',
    icon: <Home className="h-6 w-6" />,
    path: '/home-services/roofing',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'bath',
    title: 'Bath Remodel',
    description: 'Bathroom renovations and conversions',
    icon: <Layers className="h-6 w-6" />,
    path: '/home-services/bath',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'windows',
    title: 'Windows',
    description: 'Window installation and replacement',
    icon: <Square className="h-6 w-6" />,
    path: '/home-services/windows',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'Heating and cooling systems',
    icon: <Thermometer className="h-6 w-6" />,
    path: '/home-services/hvac',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'kitchen',
    title: 'Kitchen Remodel',
    description: 'Kitchen renovations and updates',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    path: '/home-services/kitchen',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Plumbing repairs and installations',
    icon: <Droplets className="h-6 w-6" />,
    path: '/home-services/plumbing',
    color: 'from-blue-500 to-cyan-600'
  }
];

// ============================================================================
// SERVICE-SPECIFIC OPTIONS (from spec)
// ============================================================================

// Roofing - API spec aligned
const roofingOptions = {
  install_repair: [
    { label: 'Install New Roof', value: 'Install' },
    { label: 'Repair Existing Roof', value: 'Repair' }
  ],
  property_type: [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' }
  ],
  roof_type: [
    { label: 'Asphalt Shingle', value: 'Asphalt Shingle' },
    { label: 'Metal', value: 'Metal' },
    { label: 'Tile', value: 'Tile' },
    { label: 'Cedar Shake', value: 'Cedar Shake' },
    { label: 'Tar/Torchdown', value: 'Tar Torchdown' },
    { label: 'Natural Slate', value: 'Natural Slate' }
  ],
  product_type: [
    { label: 'Asphalt Shingles', value: 'shingles' },
    { label: 'Metal Roofing', value: 'metal' },
    { label: 'Tile Roofing', value: 'tile' },
    { label: 'Flat Roofing', value: 'flat' },
    { label: 'Wood Roofing', value: 'wood' }
  ]
};

// Bath - Backend spec aligned
const bathOptions = {
  property_type: [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' }
  ],
  home_type: [
    { label: 'Single Family', value: 'single_family' },
    { label: 'Multi-Family', value: 'multi_family' },
    { label: 'Townhouse', value: 'townhouse' },
    { label: 'Condo', value: 'condo' },
    { label: 'Mobile Home', value: 'mobile_home' }
  ],
  remodel_type: [
    { label: 'Complete Remodel', value: 'complete_remodel' },
    { label: 'Partial Remodel', value: 'partial_remodel' },
    { label: 'Tub to Shower Conversion', value: 'tub_to_shower' },
    { label: 'Shower to Tub Conversion', value: 'shower_to_tub' },
    { label: 'Walk-in Tub', value: 'walk_in_tub' }
  ],
  service: [
    { label: 'Bath Remodel (no walls changed)', value: 'Bath Remodel no walls added or removed' },
    { label: 'Bath Remodel (walls changed)', value: 'Bath Remodel with walls added or removed' }
  ]
};

// Windows - API spec aligned
const windowsOptions = {
  install_repair: [
    { label: 'Install New Windows', value: 'Install' },
    { label: 'Repair Windows', value: 'Repair' }
  ],
  property_type: [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' }
  ],
  product_count: [
    { label: '1 Window', value: '1' },
    { label: '2 Windows', value: '2' },
    { label: '3 Windows', value: '3' },
    { label: '4 Windows', value: '4' },
    { label: '5 Windows', value: '5' },
    { label: '6 Windows', value: '6' },
    { label: '7 Windows', value: '7' },
    { label: '8 Windows', value: '8' },
    { label: '9+ Windows', value: '9' }
  ],
  material: [
    { label: 'Vinyl', value: 'VINYL' },
    { label: 'Wood', value: 'WOOD' },
    { label: 'Aluminum', value: 'ALUMINUM' },
    { label: 'Fiberglass', value: 'FIBERGLASS' },
    { label: 'Composite', value: 'COMPOSITE' },
    { label: 'Metal', value: 'METAL' },
    { label: 'Brick or Stone', value: 'BRICK OR STONE' }
  ]
};

// HVAC - API spec aligned
const hvacOptions = {
  property_type: [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' }
  ],
  air_type: [
    { label: 'Cooling (AC)', value: 'Cooling' },
    { label: 'Heating', value: 'Heating' },
    { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
  ],
  air_sub_type: {
    Cooling: [
      { label: 'Central Air', value: 'Central Air' },
      { label: 'Heat Pump', value: 'Heat Pump' },
      { label: 'Window Unit', value: 'Window Unit' }
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
  },
  project_type: [
    { label: 'Repair', value: 'Repair' },
    { label: 'New Unit Installed', value: 'New Unit Installed' },
    { label: 'Service', value: 'Service' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Upgrade', value: 'Upgrade' }
  ],
  service: {
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
    Upgrade: [
      { label: 'A/C Upgrade', value: 'A/C Upgrade' },
      { label: 'Furnace Upgrade', value: 'Furnace Upgrade' },
      { label: 'Full System Upgrade', value: 'Full System Upgrade' }
    ]
  }
};

// Kitchen - API spec aligned
const kitchenOptions = {
  service: [
    { label: 'Kitchen Remodel (no walls changed)', value: 'Kitchen Remodel no walls added or removed' },
    { label: 'Kitchen Remodel (walls changed)', value: 'Kitchen Remodel remove or add walls' }
  ]
};

// Plumbing - API spec aligned (matching PlumbingLander.tsx values)
const plumbingOptions = {
  service: [
    { label: 'Plumbing Repair', value: 'Plumbing Repair' },
    { label: 'Plumbing Install', value: 'Plumbing Install' },
    { label: 'Drain Cleaning', value: 'Drain Cleaning' },
    { label: 'Water Heater Repair', value: 'Water Heater Repair' },
    { label: 'Water Heater Replacement', value: 'Water Heater Replacement' },
    { label: 'Pipe Repair', value: 'Pipe Repair' },
    { label: 'Emergency Plumbing', value: 'Emergency Plumbing' }
  ]
};

// ============================================================================
// SERVICE QUESTION STEPS GENERATOR
// ============================================================================

interface ServiceQuestionStep {
  serviceId: string;
  questionId: string;
  title: string;
  subtitle: string;
  field: string;
  options: OptionItem[];
  icon: React.ReactNode;
  iconColor: string;
  gridLayout?: boolean;
}

function getServiceQuestionSteps(serviceId: string, answers: FormAnswers): ServiceQuestionStep[] {
  const steps: ServiceQuestionStep[] = [];

  switch (serviceId) {
    case 'roofing':
      steps.push({
        serviceId: 'roofing',
        questionId: 'roofing_install_repair',
        title: 'What Do You Need? (Roofing)',
        subtitle: 'Select the type of roofing service',
        field: 'roofing_install_repair',
        options: roofingOptions.install_repair,
        icon: <Wrench className="h-8 w-8 text-white" />,
        iconColor: 'from-blue-500 to-blue-600'
      });
      // Property type removed - hardcoded to Residential
      steps.push({
        serviceId: 'roofing',
        questionId: 'roofing_roof_type',
        title: 'Current Roof Type',
        subtitle: 'What type of roofing do you currently have?',
        field: 'roofing_roof_type',
        options: roofingOptions.roof_type,
        icon: <Layers className="h-8 w-8 text-white" />,
        iconColor: 'from-purple-500 to-purple-600',
        gridLayout: true
      });
      steps.push({
        serviceId: 'roofing',
        questionId: 'roofing_product_type',
        title: 'Preferred Material',
        subtitle: 'What roofing material would you like?',
        field: 'roofing_product_type',
        options: roofingOptions.product_type,
        icon: <HardHat className="h-8 w-8 text-white" />,
        iconColor: 'from-orange-500 to-orange-600'
      });
      break;

    case 'bath':
      // Property type removed - hardcoded to Residential
      steps.push({
        serviceId: 'bath',
        questionId: 'bath_home_type',
        title: 'What Type of Home?',
        subtitle: 'Select your home type',
        field: 'bath_home_type',
        options: bathOptions.home_type,
        icon: <Layers className="h-8 w-8 text-white" />,
        iconColor: 'from-green-500 to-green-600'
      });
      steps.push({
        serviceId: 'bath',
        questionId: 'bath_remodel_type',
        title: 'What Type of Remodel?',
        subtitle: 'What best describes your project?',
        field: 'bath_remodel_type',
        options: bathOptions.remodel_type,
        icon: <Wrench className="h-8 w-8 text-white" />,
        iconColor: 'from-purple-500 to-purple-600'
      });
      steps.push({
        serviceId: 'bath',
        questionId: 'bath_service',
        title: 'Service Needed (Bath)',
        subtitle: 'Select the specific service',
        field: 'bath_service',
        options: bathOptions.service,
        icon: <Layers className="h-8 w-8 text-white" />,
        iconColor: 'from-blue-500 to-blue-600'
      });
      break;

    case 'windows':
      steps.push({
        serviceId: 'windows',
        questionId: 'windows_install_repair',
        title: 'What Do You Need? (Windows)',
        subtitle: 'Select the type of window service',
        field: 'windows_install_repair',
        options: windowsOptions.install_repair,
        icon: <Wrench className="h-8 w-8 text-white" />,
        iconColor: 'from-indigo-500 to-indigo-600'
      });
      // Property type removed - hardcoded to Residential
      steps.push({
        serviceId: 'windows',
        questionId: 'windows_product_count',
        title: 'How Many Windows?',
        subtitle: 'Select the number of windows',
        field: 'windows_product_count',
        options: windowsOptions.product_count,
        icon: <Square className="h-8 w-8 text-white" />,
        iconColor: 'from-purple-500 to-purple-600',
        gridLayout: true
      });
      steps.push({
        serviceId: 'windows',
        questionId: 'windows_material',
        title: 'Preferred Material',
        subtitle: 'What window material would you like?',
        field: 'windows_material',
        options: windowsOptions.material,
        icon: <Layers className="h-8 w-8 text-white" />,
        iconColor: 'from-orange-500 to-orange-600'
      });
      break;

    case 'hvac':
      // Property type removed - hardcoded to Residential
      steps.push({
        serviceId: 'hvac',
        questionId: 'hvac_air_type',
        title: 'System Type',
        subtitle: 'What type of HVAC system do you need help with?',
        field: 'hvac_air_type',
        options: hvacOptions.air_type,
        icon: <Thermometer className="h-8 w-8 text-white" />,
        iconColor: 'from-red-500 to-orange-500'
      });
      steps.push({
        serviceId: 'hvac',
        questionId: 'hvac_air_sub_type',
        title: 'Specific System',
        subtitle: 'What type of system do you have or want?',
        field: 'hvac_air_sub_type',
        options: hvacOptions.air_sub_type[answers.hvac_air_type as keyof typeof hvacOptions.air_sub_type] || hvacOptions.air_sub_type.Cooling,
        icon: answers.hvac_air_type === 'Heating' ? <Flame className="h-8 w-8 text-white" /> : <Fan className="h-8 w-8 text-white" />,
        iconColor: answers.hvac_air_type === 'Heating' ? 'from-red-500 to-orange-500' : 'from-cyan-500 to-blue-500'
      });
      steps.push({
        serviceId: 'hvac',
        questionId: 'hvac_project_type',
        title: 'What Do You Need? (HVAC)',
        subtitle: 'Select the type of service',
        field: 'hvac_project_type',
        options: hvacOptions.project_type,
        icon: <Wrench className="h-8 w-8 text-white" />,
        iconColor: 'from-green-500 to-green-600'
      });
      steps.push({
        serviceId: 'hvac',
        questionId: 'hvac_service',
        title: 'Service Needed (HVAC)',
        subtitle: 'Select the specific service you need',
        field: 'hvac_service',
        options: hvacOptions.service[answers.hvac_project_type as keyof typeof hvacOptions.service] || hvacOptions.service.Repair,
        icon: <Wrench className="h-8 w-8 text-white" />,
        iconColor: 'from-purple-500 to-purple-600'
      });
      break;

    case 'kitchen':
      steps.push({
        serviceId: 'kitchen',
        questionId: 'kitchen_service',
        title: 'Kitchen Remodel Type',
        subtitle: 'Select the scope of your project',
        field: 'kitchen_service',
        options: kitchenOptions.service,
        icon: <UtensilsCrossed className="h-8 w-8 text-white" />,
        iconColor: 'from-amber-500 to-orange-600'
      });
      break;

    case 'plumbing':
      steps.push({
        serviceId: 'plumbing',
        questionId: 'plumbing_service',
        title: 'Plumbing Service Needed',
        subtitle: 'Select the service that best fits your needs',
        field: 'plumbing_service',
        options: plumbingOptions.service,
        icon: <Droplets className="h-8 w-8 text-white" />,
        iconColor: 'from-blue-500 to-cyan-600'
      });
      break;
  }

  return steps;
}

// ============================================================================
// STEP TYPE ENUM
// ============================================================================

type StepType = 'service_selection' | 'home_owner' | 'address' | 'service_question' | 'contact_info';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HomeServicesHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [prefilledData, setPrefilledData] = useState<LeadData | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [detectedLeadId, setDetectedLeadId] = useState<string>('');
  const [detectedTrustedFormCert, setDetectedTrustedFormCert] = useState<string>('');
  const [queryParams, setQueryParams] = useState<{ [key: string]: string }>({});

  // Extract publisher_id from query params (pid) or default to "house"
  const getPublisherId = () => {
    return queryParams.pid || "house";
  };

  // Multi-step flow state
  const [isMultiStepMode, setIsMultiStepMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [allSteps, setAllSteps] = useState<Array<{ type: StepType; data?: ServiceQuestionStep }>>([]);

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

  // Facebook Pixel and Propel Click Enrichment tracking
  useEffect(() => {
    // Facebook Pixel (must load first)
    if (!(window as any).fbq) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1579605026494477');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    } else {
      (window as any).fbq('track', 'PageView');
    }

    // Propel Click Enrichment snippet
    if (!document.querySelector('script[src*="propel-lander-api"]')) {
      const propelScript = document.createElement('script');
      propelScript.src = 'https://propel-lander-api.propelsys.workers.dev/snippet.js';
      propelScript.async = true;
      propelScript.onload = () => {
        if ((window as any).Propel && typeof (window as any).Propel.init === 'function') {
          (window as any).Propel.init({
            apiUrl: 'https://propel-lander-api.propelsys.workers.dev',
            landerId: '93250e76-b902-4d91-ab11-483d0387c0dd',
            clickIdParam: 'sub5',
            delay: 2500
          });
        }
      };
      document.head.appendChild(propelScript);
    } else if ((window as any).Propel && typeof (window as any).Propel.init === 'function') {
      (window as any).Propel.init({
        apiUrl: 'https://propel-lander-api.propelsys.workers.dev',
        landerId: '93250e76-b902-4d91-ab11-483d0387c0dd',
        clickIdParam: 'sub5',
        delay: 2500
      });
    }
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

  // Check for pre-filled data from cash lander and collect query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Collect all query parameters
    const allParams: { [key: string]: string } = {};
    params.forEach((value, key) => {
      if (key !== 'ld') {
        allParams[key] = value;
      }
    });
    setQueryParams(allParams);

    const leadData = decodeLeadData(params);
    if (leadData) {
      setPrefilledData(leadData);
      // Pre-fill answers
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
  }, [location.search]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAnswer = useCallback((field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }, []);

  const buildSteps = useCallback(() => {
    const steps: Array<{ type: StepType; data?: ServiceQuestionStep }> = [];

    // Step 1: Home Owner (if not pre-filled)
    if (!prefilledData?.home_owner) {
      steps.push({ type: 'home_owner' });
    }

    // Step 2: Address (if not pre-filled)
    if (!hasAddressInfo(prefilledData)) {
      steps.push({ type: 'address' });
    }

    // Steps 3-N: Service-specific questions for each selected service
    selectedServices.forEach(serviceId => {
      const serviceSteps = getServiceQuestionSteps(serviceId, answers);
      serviceSteps.forEach(step => {
        steps.push({ type: 'service_question', data: step });
      });
    });

    // Final step: Contact Info (if not pre-filled)
    if (!hasContactInfo(prefilledData)) {
      steps.push({ type: 'contact_info' });
    }

    return steps;
  }, [selectedServices, prefilledData, answers]);

  // Rebuild steps when answers change (for conditional questions like HVAC)
  useEffect(() => {
    if (isMultiStepMode) {
      const newSteps = buildSteps();
      setAllSteps(newSteps);
    }
  }, [isMultiStepMode, buildSteps]);

  const handleContinue = () => {
    if (selectedServices.length === 0) return;

    if (selectedServices.length === 1) {
      // Single service - go directly to that service page with query params
      const service = services.find(s => s.id === selectedServices[0]);
      if (service) {
        if (prefilledData) {
          // Pass query params along with prefilled data
          navigate(buildHandoffUrl(service.path, prefilledData, queryParams));
        } else {
          // No prefilled data, but still pass query params
          const params = new URLSearchParams(queryParams);
          const queryString = params.toString();
          navigate(queryString ? `${service.path}?${queryString}` : service.path);
        }
      }
    } else {
      // Multiple services - enter multi-step mode
      const steps = buildSteps();
      setAllSteps(steps);
      setCurrentStepIndex(0);
      setIsMultiStepMode(true);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const cleanedPhone = answers.phone_number?.replace(/\D/g, '') || '';
    const leadidToken = getLeadIdToken();
    const trustedFormCert = getTrustedFormCert();

    // Common lead data for all services
    const commonData = {
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
      tcpa_text: 'By clicking "Get My Free Quote" below, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: leadidToken,  // Jornaya LeadID token
      trustedform_cert_url: trustedFormCert,  // TrustedForm certificate URL
      query_parameters: queryParams,  // UTM params and tracking data
      publisher_id: getPublisherId(),  // Publisher/affiliate ID
    };

    // Build service-specific data for each selected service
    const servicesData = selectedServices.map(serviceId => {
      const serviceData: Record<string, any> = {};

      switch (serviceId) {
        case 'roofing':
          serviceData.install_repair = answers.roofing_install_repair;
          serviceData.property_type = 'Residential';  // Hardcoded - always residential
          serviceData.roof_type = answers.roofing_roof_type;
          serviceData.product_type = answers.roofing_product_type;
          break;
        case 'bath':
          serviceData.property_type = 'Residential';  // Hardcoded - always residential
          serviceData.home_type = answers.bath_home_type;
          serviceData.remodel_type = answers.bath_remodel_type;
          serviceData.service = answers.bath_service;
          break;
        case 'windows':
          serviceData.install_repair = answers.windows_install_repair;
          serviceData.property_type = 'Residential';  // Hardcoded - always residential
          serviceData.product_count = answers.windows_product_count;
          serviceData.material = answers.windows_material;
          break;
        case 'hvac':
          serviceData.property_type = 'Residential';  // Hardcoded - always residential
          serviceData.air_type = answers.hvac_air_type;
          serviceData.air_sub_type = answers.hvac_air_sub_type;
          serviceData.project_type = answers.hvac_project_type;
          // Note: service is auto-derived by backend from air_sub_type + project_type
          break;
        case 'kitchen':
          serviceData.service = answers.kitchen_service;
          break;
        case 'plumbing':
          serviceData.service = answers.plumbing_service;
          break;
      }

      return {
        serviceType: serviceId as ServiceType,
        serviceData
      };
    });

    try {
      const results = await submitMultipleHomeServicesLeads(commonData, servicesData);

      const successCount = results.filter(r => r.result.success).length;
      const failureCount = results.filter(r => !r.result.success).length;

      if (successCount > 0) {
        setIsSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your requests. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error submitting multi-service leads:', error);
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

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderServiceSelection = () => (
    <AnimatedCard>
      <StepHeader
        icon={<Home className="h-8 w-8 text-white" />}
        iconColor="from-primary to-primary/80"
        title="What Services Do You Need?"
        subtitle="Select one or more services to get free quotes"
      />

      <div className="space-y-3 mb-6">
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
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={selectedServices.length === 0}
        className="w-full py-6 text-lg font-bold bg-brand-navy text-white hover:bg-brand-darkblue shadow-button hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-2 border-brand-navy"
      >
        {selectedServices.length === 0
          ? 'Select at Least One Service'
          : `Get Free Quote${selectedServices.length > 1 ? 's' : ''}`
        }
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>

      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          100% Free Quotes - No Obligation
        </p>
      </div>
    </AnimatedCard>
  );

  const renderServiceQuestionStep = (step: ServiceQuestionStep) => (
    <AnimatedCard>
      <StepHeader
        icon={step.icon}
        iconColor={step.iconColor}
        title={step.title}
        subtitle={step.subtitle}
      />

      <div className="space-y-2 mb-6">
        {step.gridLayout ? (
          <div className="grid grid-cols-2 gap-2">
            {step.options.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={answers[step.field] === option.value}
                onClick={() => {
                  handleAnswer(step.field, option.value);
                  handleNextStep();
                }}
                size="compact"
              />
            ))}
          </div>
        ) : (
          step.options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={answers[step.field] === option.value}
              onClick={() => {
                handleAnswer(step.field, option.value);
                handleNextStep();
              }}
            />
          ))
        )}
      </div>

      <StepFooter />
    </AnimatedCard>
  );

  const renderCurrentStep = () => {
    if (!isMultiStepMode) {
      return renderServiceSelection();
    }

    const currentStep = allSteps[currentStepIndex];
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'home_owner':
        return (
          <HomeOwnerStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={handleNextStep}
          />
        );
      case 'address':
        return (
          <AddressStep
            answers={answers}
            handleAnswer={handleAnswer}
            onNext={handleNextStep}
          />
        );
      case 'service_question':
        return currentStep.data ? renderServiceQuestionStep(currentStep.data) : null;
      case 'contact_info':
        return (
          <ContactInfoStep
            answers={answers}
            handleAnswer={handleAnswer}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            title={`Get Your Free Quote${selectedServices.length > 1 ? 's' : ''}!`}
            buttonText={`Get ${selectedServices.length} Free Quote${selectedServices.length > 1 ? 's' : ''}`}
          />
        );
      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isSubmitted) {
    return (
      <SuccessScreen
        title="Thank You!"
        message={`Your quote requests for ${selectedServices.length} services have been received. Qualified specialists in your area will contact you shortly.`}
        serviceName="home service"
      />
    );
  }

  const totalSteps = isMultiStepMode ? allSteps.length : 1;
  const displayStep = isMultiStepMode ? currentStepIndex + 1 : 1;

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
          {isMultiStepMode && (
            <ProgressBar currentStep={displayStep} totalSteps={totalSteps} />
          )}

          {renderCurrentStep()}

          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />

          {/* Quick links - only show when not in multi-step mode */}
          {!isMultiStepMode && (
            <div className="mt-8">
              <h2 className="text-center text-sm font-medium text-muted-foreground mb-4">
                Or go directly to a service:
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {services.map((service) => (
                  <Button
                    key={service.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (prefilledData) {
                        navigate(buildHandoffUrl(service.path, prefilledData, queryParams));
                      } else {
                        const params = new URLSearchParams(queryParams);
                        const queryString = params.toString();
                        navigate(queryString ? `${service.path}?${queryString}` : service.path);
                      }
                    }}
                    className="text-xs"
                  >
                    {service.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
