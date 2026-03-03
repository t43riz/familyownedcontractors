/**
 * HVAC Lander Variation C — "Minimal Speed" Theme
 * Clean, fast-loading, gamified progress with checkmarks
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import {
  Thermometer, Home, Wrench, Fan, Flame, CheckCircle, MapPin,
  User, Phone, Mail, ChevronRight, Lock, Clock, Zap, Star, Shield, BadgeCheck, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead } from '@/services/homeServicesApi';

const TOTAL_STEPS = 7;

const airTypeOptions = [
  { label: 'Cooling (AC)', value: 'Cooling' },
  { label: 'Heating', value: 'Heating' },
  { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
];

const airSubTypeOptions: Record<string, Array<{label: string; value: string}>> = {
  Cooling: [{ label: 'Central Air', value: 'Central Air' }, { label: 'Heat Pump', value: 'Heat Pump' }],
  Heating: [
    { label: 'Gas Furnace', value: 'Gas Furnace' }, { label: 'Electric Furnace', value: 'Electric Furnace' },
    { label: 'Propane Furnace', value: 'Propane Furnace' }, { label: 'Oil Furnace', value: 'Oil Furnace' },
    { label: 'Boiler', value: 'Boiler' }, { label: 'Heat Pump', value: 'Heat Pump' }
  ],
  'Heating and Cooling': [
    { label: 'Central Air', value: 'Central Air' }, { label: 'Heat Pump', value: 'Heat Pump' },
    { label: 'Gas Furnace', value: 'Gas Furnace' }, { label: 'Electric Furnace', value: 'Electric Furnace' }
  ]
};

const projectTypeOptions = [
  { label: 'Repair', value: 'Repair' }, { label: 'New Unit Installed', value: 'New Unit Installed' },
  { label: 'Install', value: 'Install' }, { label: 'Replace', value: 'Replace' },
  { label: 'Service', value: 'Service' }, { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Cleaning', value: 'Cleaning' }, { label: 'Upgrade', value: 'Upgrade' }
];

const serviceOptions: Record<string, Array<{label: string; value: string}>> = {
  Repair: [
    { label: 'A/C Repair', value: 'A/C Repair' }, { label: 'Furnace/Heating System Repair', value: 'Furnace/Heating System Repair' },
    { label: 'Heat Pump Repair', value: 'Heat Pump Repair' }, { label: 'Boiler Repair', value: 'Boiler Repair' }
  ],
  'New Unit Installed': [
    { label: 'A/C Install', value: 'A/C Install' }, { label: 'Furnace/Heating System Install', value: 'Furnace/Heating System Install' },
    { label: 'Heat Pump Install', value: 'Heat Pump Install' }, { label: 'Boiler Install', value: 'Boiler Install' }
  ],
  Install: [
    { label: 'A/C Install', value: 'A/C Install' }, { label: 'Furnace/Heating System Install', value: 'Furnace/Heating System Install' },
    { label: 'Heat Pump Install', value: 'Heat Pump Install' }, { label: 'Boiler Install', value: 'Boiler Install' }
  ],
  Replace: [
    { label: 'A/C Replacement', value: 'A/C Replacement' }, { label: 'Furnace Replacement', value: 'Furnace Replacement' },
    { label: 'Heat Pump Replacement', value: 'Heat Pump Replacement' }, { label: 'Boiler Replacement', value: 'Boiler Replacement' }
  ],
  Service: [
    { label: 'A/C Service', value: 'A/C Service' }, { label: 'Furnace Service', value: 'Furnace Service' },
    { label: 'Heat Pump Service', value: 'Heat Pump Service' }
  ],
  Maintenance: [
    { label: 'A/C Maintenance', value: 'A/C Maintenance' }, { label: 'Furnace Maintenance', value: 'Furnace Maintenance' },
    { label: 'Full System Maintenance', value: 'Full System Maintenance' }
  ],
  Cleaning: [
    { label: 'Duct Cleaning', value: 'Duct Cleaning' }, { label: 'A/C Cleaning', value: 'A/C Cleaning' },
    { label: 'Furnace Cleaning', value: 'Furnace Cleaning' }
  ],
  Upgrade: [
    { label: 'A/C Upgrade', value: 'A/C Upgrade' }, { label: 'Furnace Upgrade', value: 'Furnace Upgrade' },
    { label: 'Full System Upgrade', value: 'Full System Upgrade' }
  ]
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const testimonials = [
  { name: "Mike R.", location: "Phoenix, AZ", text: "Saved $2,400 on my new AC unit!" },
  { name: "Sarah K.", location: "Dallas, TX", text: "Same-day furnace repair. Amazing." },
  { name: "James T.", location: "Atlanta, GA", text: "3 quotes in one day. Best price." },
];

const MiniTestimonial = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = testimonials[idx];
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-4 transition-all duration-500">
      <div className="flex items-center gap-1 mb-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}
        <span className="text-[10px] text-gray-500 ml-1">— {t.name}, {t.location}</span>
      </div>
      <p className="text-gray-600 text-xs">"{t.text}"</p>
    </div>
  );
};

const TrustBadgesC = () => (
  <div className="flex items-center justify-center gap-4 mt-4 py-2">
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> BBB Accredited
    </div>
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <Users className="h-3.5 w-3.5 text-emerald-500" /> 50K+ Projects
    </div>
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <Shield className="h-3.5 w-3.5 text-emerald-500" /> Licensed
    </div>
  </div>
);

const SegmentedProgress = ({ step, total }: { step: number; total: number }) => {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-300' : 'bg-gray-200'
            }`} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" /> ~{Math.max(15, 60 - (step * 8))} seconds left
        </span>
        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          {step > 1 && <CheckCircle className="h-3 w-3" />}
          {pct}% complete
        </span>
      </div>
    </div>
  );
};

const MinimalOption = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full py-3.5 px-4 rounded-lg text-left font-medium transition-all duration-150 border text-[15px] flex items-center justify-between ${
      isSelected
        ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm'
        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 active:scale-[0.99]'
    }`}
  >
    <span>{label}</span>
    {isSelected ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <ChevronRight className="h-4 w-4 text-gray-300" />}
  </button>
);

const StepCard = ({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-lg mx-auto">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ============================================================================
// STEP COMPONENTS
// ============================================================================

const StepSystemType = ({ answers, handleAnswer }: any) => (
  <StepCard icon={<Thermometer className="h-5 w-5" />} title="Let's Fix Your Comfort" subtitle="What system needs attention?">
    <div className="space-y-2">
      {airTypeOptions.map(opt => (
        <MinimalOption key={opt.value} label={opt.label} isSelected={answers.air_type === opt.value}
          onClick={() => { handleAnswer('air_type', opt.value); handleAnswer('step', 3); }} />
      ))}
    </div>
    <MiniTestimonial />
  </StepCard>
);

const StepSpecificSystem = ({ answers, handleAnswer }: any) => {
  const options = airSubTypeOptions[answers.air_type || 'Cooling'] || airSubTypeOptions.Cooling;
  return (
    <StepCard icon={answers.air_type === 'Heating' ? <Flame className="h-5 w-5" /> : <Fan className="h-5 w-5" />}
      title="Narrow It Down" subtitle="What type of system specifically?">
      <div className="space-y-2">
        {options.map(opt => (
          <MinimalOption key={opt.value} label={opt.label} isSelected={answers.air_sub_type === opt.value}
            onClick={() => { handleAnswer('air_sub_type', opt.value); handleAnswer('step', 4); }} />
        ))}
      </div>
    </StepCard>
  );
};

const StepProjectType = ({ answers, handleAnswer }: any) => (
  <StepCard icon={<Wrench className="h-5 w-5" />} title="What Work Is Needed?" subtitle="Select for the most accurate quote">
    <div className="space-y-2">
      {projectTypeOptions.map(opt => (
        <MinimalOption key={opt.value} label={opt.label} isSelected={answers.project_type === opt.value}
          onClick={() => { handleAnswer('project_type', opt.value); handleAnswer('step', 5); }} />
      ))}
    </div>
  </StepCard>
);

const StepService = ({ answers, handleAnswer }: any) => {
  const options = serviceOptions[answers.project_type || 'Repair'] || serviceOptions.Repair;
  return (
    <StepCard icon={<Zap className="h-5 w-5" />} title="Specific Service" subtitle="Which service do you need?">
      <div className="space-y-2">
        {options.map(opt => (
          <MinimalOption key={opt.value} label={opt.label} isSelected={answers.service === opt.value}
            onClick={() => { handleAnswer('service', opt.value); handleAnswer('step', 6); }} />
        ))}
      </div>
    </StepCard>
  );
};

const StepHomeOwner = ({ answers, handleAnswer, onNext }: any) => (
  <StepCard icon={<Home className="h-5 w-5" />} title="Homeowner?" subtitle="Quick verification">
    <div className="space-y-2">
      <MinimalOption label="Yes, I own this home" isSelected={answers.home_owner === 'True'}
        onClick={() => { handleAnswer('home_owner', 'True'); onNext?.(); }} />
      <MinimalOption label="No, I don't own it" isSelected={answers.home_owner === 'False'}
        onClick={() => { handleAnswer('home_owner', 'False'); onNext?.(); }} />
    </div>
  </StepCard>
);

const StepAddress = ({ answers, handleAnswer, onNext }: any) => {
  const [addressInput, setAddressInput] = useState(answers.property_address || '');
  const [isAddressSelected, setIsAddressSelected] = useState(!!answers.property_address);
  const [showManual, setShowManual] = useState(false);
  const [mapsLoadFailed, setMapsLoadFailed] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState({ street: '', city: '', state: '', zip: '' });

  useEffect(() => {
    if (showManual) return;
    const load = () => {
      if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyChtAF62LK9EKAsu2jv75MPfiLODwCWouw&libraries=places`;
        script.async = true; script.defer = true;
        script.onerror = () => setMapsLoadFailed(true);
        script.onload = init;
        document.head.appendChild(script);
      } else { init(); }
    };
    const init = () => {
      if (!inputRef.current) return;
      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'], componentRestrictions: { country: 'us' }
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.address_components) return;
          let city = '', state = '', zip = '';
          for (const c of place.address_components) {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.short_name;
            if (c.types.includes('postal_code')) zip = c.long_name;
          }
          handleAnswer('property_address', place.formatted_address || '');
          if (city) handleAnswer('city', city);
          if (state) handleAnswer('state', state);
          if (zip) handleAnswer('zip_code', zip);
          setAddressInput(place.formatted_address || '');
          setIsAddressSelected(true);
        });
      } catch { setMapsLoadFailed(true); }
    };
    load();
  }, [handleAnswer, showManual]);

  const handleManualChange = (field: string, value: string) => {
    setManual(prev => ({ ...prev, [field]: value }));
    if (field === 'street') handleAnswer('street_address', value);
    else if (field === 'city') { handleAnswer('manual_city', value); handleAnswer('city', value); }
    else if (field === 'state') { handleAnswer('manual_state', value); handleAnswer('state', value); }
    else if (field === 'zip') { handleAnswer('manual_zip', value); handleAnswer('zip_code', value); }
    const full = `${field === 'street' ? value : manual.street}, ${field === 'city' ? value : manual.city}, ${field === 'state' ? value : manual.state} ${field === 'zip' ? value : manual.zip}`;
    handleAnswer('property_address', full);
  };

  const canProceed = showManual
    ? manual.street && manual.city && manual.state && manual.zip
    : (answers.property_address?.trim() && (isAddressSelected || mapsLoadFailed));

  return (
    <StepCard icon={<MapPin className="h-5 w-5" />} title="Property Address" subtitle="For local contractor matching">
      {!showManual ? (
        <div className="space-y-2">
          <Input ref={inputRef} placeholder="Start typing your address..." value={addressInput}
            onChange={(e) => { setAddressInput(e.target.value); setIsAddressSelected(false); }}
            className="text-base py-4 rounded-lg" />
          {!isAddressSelected && addressInput && <p className="text-xs text-amber-600">Select from dropdown</p>}
          <button onClick={() => setShowManual(true)} className="text-xs text-gray-400 underline">Enter manually</button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input placeholder="Street Address" value={manual.street} onChange={(e) => handleManualChange('street', e.target.value)} className="py-4 rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" value={manual.city} onChange={(e) => handleManualChange('city', e.target.value)} className="py-4 rounded-lg" />
            <Input placeholder="State" maxLength={2} value={manual.state} onChange={(e) => handleManualChange('state', e.target.value.toUpperCase())} className="py-4 rounded-lg" />
          </div>
          <Input placeholder="ZIP" maxLength={5} value={manual.zip} onChange={(e) => handleManualChange('zip', e.target.value)} className="py-4 rounded-lg" />
          <button onClick={() => setShowManual(false)} className="text-xs text-gray-400 underline">Back to search</button>
        </div>
      )}
      <Button onClick={onNext} disabled={!canProceed} className="w-full mt-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold">
        Continue <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </StepCard>
  );
};

const StepContact = ({ answers, handleAnswer, onSubmit, isLoading }: any) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const e: Record<string, string> = {};
    if (!answers.first_name?.trim() || answers.first_name.trim().length < 2) e.first_name = 'Required';
    if (!answers.last_name?.trim() || answers.last_name.trim().length < 2) e.last_name = 'Required';
    const phone = (answers.phone_number || '').replace(/\D/g, '');
    if (phone.length !== 10) e.phone_number = '10 digits required';
    if (!answers.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <StepCard icon={<CheckCircle className="h-5 w-5" />} title="Get Your Free Quote" subtitle="Last step — takes 15 seconds">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
        <p className="text-sm font-semibold text-emerald-700 text-center">✅ Compare quotes from top-rated local pros</p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1">First Name</Label>
            <Input placeholder="John" value={answers.first_name || ''}
              onChange={(e) => handleAnswer('first_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
              className={`py-4 rounded-lg ${errors.first_name ? 'border-red-400' : ''}`} />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1">Last Name</Label>
            <Input placeholder="Doe" value={answers.last_name || ''}
              onChange={(e) => handleAnswer('last_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
              className={`py-4 rounded-lg ${errors.last_name ? 'border-red-400' : ''}`} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1">Phone</Label>
          <Input placeholder="(555) 123-4567" value={answers.phone_number || ''}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '');
              if (v.length > 10 && v.startsWith('1')) v = v.substring(1);
              v = v.slice(0, 10);
              let f = v;
              if (v.length >= 6) f = v.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
              else if (v.length >= 3) f = v.replace(/(\d{3})(\d{0,3})/, '($1) $2');
              else if (v.length > 0) f = `(${v}`;
              handleAnswer('phone_number', f);
            }}
            className={`py-4 rounded-lg ${errors.phone_number ? 'border-red-400' : ''}`} />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1">Email</Label>
          <Input type="email" placeholder="john@example.com" value={answers.email || ''}
            onChange={(e) => handleAnswer('email', e.target.value)}
            className={`py-4 rounded-lg ${errors.email ? 'border-red-400' : ''}`} />
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          By submitting, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its{' '}
          <a href="/partners" target="_blank" className="text-emerald-500 underline">marketing partners</a>, including American Residential Services LLC,
          affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services
          via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone
          dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply.
          Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any
          state or federal Do-Not-Call registry. I have read and agree to the{' '}
          <a href="/privacy" target="_blank" className="text-emerald-500 underline">Privacy Policy</a> and{' '}
          <a href="/terms" target="_blank" className="text-emerald-500 underline">Terms of Service</a>.
        </p>
        <Button onClick={() => validate() && onSubmit()} disabled={isLoading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-base">
          {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Submitting...</>
            : 'Get My Free Quote →'}
        </Button>
        <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" /> 100% free • No obligation
        </p>
      </div>
    </StepCard>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HVACLanderC() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<LeadData | null>(null);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [actualTotalSteps, setActualTotalSteps] = useState(TOTAL_STEPS);
  const [detectedLeadId, setDetectedLeadId] = useState('');
  const [detectedTrustedFormCert, setDetectedTrustedFormCert] = useState('');

  useEffect(() => {
    const monitor = () => {
      const lid = document.getElementById('leadid_token') as HTMLInputElement;
      if (lid?.value) setDetectedLeadId(lid.value);
      const tf = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
      if (tf?.value) setDetectedTrustedFormCert(tf.value);
    };
    const interval = setInterval(monitor, 1000);
    monitor(); setTimeout(monitor, 3000);
    return () => clearInterval(interval);
  }, []);

  const getLeadIdToken = (): string => {
    if (detectedLeadId) return detectedLeadId;
    return (document.getElementById('leadid_token') as HTMLInputElement)?.value || '';
  };
  const getTrustedFormCert = (): string => {
    if (detectedTrustedFormCert) return detectedTrustedFormCert;
    return (document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement)?.value || '';
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const allParams: Record<string, string> = {};
    params.forEach((v, k) => { if (k !== 'step' && k !== 'ld') allParams[k] = v; });
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
      let skip = 0;
      if (hasAddressInfo(leadData)) skip++;
      if (hasContactInfo(leadData)) skip++;
      setActualTotalSteps(TOTAL_STEPS - skip);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('step');
    if (s) { const n = parseInt(s, 10); if (n >= 1 && n <= TOTAL_STEPS) setCurrentStep(n); }
  }, [location.search]);

  const updateStep = useCallback((newStep: number) => {
    setCurrentStep(newStep);
    const params = new URLSearchParams(window.location.search);
    params.set('step', newStep.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  }, [navigate, location.pathname]);

  const handleAnswer = useCallback((field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (field === 'step') updateStep(value);
  }, [updateStep]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      first_name: answers.first_name || '', last_name: answers.last_name || '',
      phone: (answers.phone_number || '').replace(/\D/g, ''), email: answers.email || '',
      address: answers.property_address || '', city: answers.city || answers.manual_city || '',
      state: answers.state || answers.manual_state || '', zip_code: answers.zip_code || answers.manual_zip || '',
      property_type: 'Residential', project_type: answers.project_type, air_type: answers.air_type,
      air_sub_type: answers.air_sub_type, home_owner: answers.home_owner || 'Yes',
      landing_page_url: window.location.href, user_agent: navigator.userAgent,
      tcpa_text: 'By submitting, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
      jornaya_leadid: getLeadIdToken(), trustedform_cert_url: getTrustedFormCert(),
      query_parameters: queryParams, original_lead_id: prefilledData?.lead_id,
    };
    try {
      const result = await submitHomeServicesLead(payload, 'hvac');
      if (result.success) setIsSubmitted(true);
      else toast({ title: "Error", description: result.error || "Failed to submit.", variant: "destructive", duration: 5000 });
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive", duration: 5000 });
    } finally { setIsLoading(false); }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: handleAnswer('step', 2); return null;
      case 2: return <StepSystemType answers={answers} handleAnswer={handleAnswer} />;
      case 3: return <StepSpecificSystem answers={answers} handleAnswer={handleAnswer} />;
      case 4: return <StepProjectType answers={answers} handleAnswer={handleAnswer} />;
      case 5: return <StepService answers={answers} handleAnswer={handleAnswer} />;
      case 6:
        if (prefilledData?.home_owner) { handleAnswer('step', 7); return null; }
        return <StepHomeOwner answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 7)} />;
      case 7:
        if (hasAddressInfo(prefilledData)) { handleAnswer('step', 8); return null; }
        return <StepAddress answers={answers} handleAnswer={handleAnswer} onNext={() => handleAnswer('step', 8)} />;
      case 8:
        if (hasContactInfo(prefilledData)) { handleSubmit(); return null; }
        return <StepContact answers={answers} handleAnswer={handleAnswer} onSubmit={handleSubmit} isLoading={isLoading} />;
      default: return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Confirmed ✓</h2>
          <p className="text-gray-600 text-sm mb-4">An HVAC specialist will contact you within 15 minutes.</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-sm text-emerald-700">📞 Keep your phone nearby</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gray-50">
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />

      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-gray-900 text-sm">Free HVAC Quotes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-500" /> No obligation</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 60 sec</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <SegmentedProgress step={currentStep} total={actualTotalSteps} />
          {renderStep()}
          <TrustBadgesC />
        </div>
      </div>

      <footer className="mt-8 py-4 border-t border-gray-100">
        <div className="text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            <a href="/privacy" target="_blank" className="hover:text-gray-600 hover:underline">Privacy</a>
            <a href="/terms" target="_blank" className="hover:text-gray-600 hover:underline">Terms</a>
            <a href="/do-not-sell" target="_blank" className="hover:text-gray-600 hover:underline">Do Not Sell</a>
          </div>
          <p className="text-[10px] text-gray-300">© {new Date().getFullYear()} FamilyOwnedContractors.com</p>
        </div>
      </footer>
    </form>
  );
}
