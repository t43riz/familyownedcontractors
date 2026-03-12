/**
 * HVAC Lander Variation B — "Conversational / Chat" Theme
 * Makes the multi-step form feel like chatting with an HVAC advisor
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import {
  Thermometer, Home, Wrench, Fan, Flame, CheckCircle, MapPin,
  User, Phone, Mail, ChevronRight, Lock, MessageCircle, Send, Shield, Star, BadgeCheck, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead } from '@/services/homeServicesApi';
import agentAvatar from '@/assets/agent-avatar.jpg';

// ============================================================================
// CONSTANTS (identical form options)
// ============================================================================
const TOTAL_STEPS = 8;

const airTypeOptions = [
  { label: 'Cooling (AC)', value: 'Cooling' },
  { label: 'Heating', value: 'Heating' },
  { label: 'Both Heating & Cooling', value: 'Heating and Cooling' }
];

const airSubTypeOptions: Record<string, Array<{label: string; value: string}>> = {
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

const projectTypeOptions = [
  { label: 'Repair', value: 'Repair' },
  { label: 'New Unit Installed', value: 'New Unit Installed' },
  { label: 'Install', value: 'Install' },
  { label: 'Replace', value: 'Replace' },
  { label: 'Service', value: 'Service' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Cleaning', value: 'Cleaning' },
  { label: 'Upgrade', value: 'Upgrade' }
];

const serviceOptions: Record<string, Array<{label: string; value: string}>> = {
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
// CHAT UI COMPONENTS
// ============================================================================

const testimonials = [
  { name: "Mike R.", location: "Phoenix, AZ", text: "Saved $2,400 on a new AC unit through this service!" },
  { name: "Sarah K.", location: "Dallas, TX", text: "Same-day furnace repair. Incredible service." },
  { name: "James T.", location: "Atlanta, GA", text: "Got 3 quotes in one day. Best price by far." },
];

const ChatTestimonial = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = testimonials[idx];
  return (
    <div className="ml-12 bg-orange-50 border border-orange-200 rounded-xl p-3 mt-3 transition-all duration-500">
      <div className="flex items-center gap-1 mb-1">
        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-orange-400 text-orange-400" />)}
      </div>
      <p className="text-gray-700 text-xs italic">"{t.text}"</p>
      <p className="text-gray-500 text-[10px] mt-1">— {t.name}, {t.location}</p>
    </div>
  );
};

const TrustBadgesB = () => (
  <div className="flex items-center justify-center gap-4 mt-4 py-3">
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <BadgeCheck className="h-3.5 w-3.5 text-orange-500" /> BBB Accredited
    </div>
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <Users className="h-3.5 w-3.5 text-orange-500" /> 50,000+ Projects
    </div>
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <Shield className="h-3.5 w-3.5 text-orange-500" /> Licensed Pros
    </div>
  </div>
);

const ChatBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <img src={agentAvatar} alt="HVAC Advisor" className="w-9 h-9 rounded-full object-cover border-2 border-orange-200 flex-shrink-0 mt-0.5" />
    <div className="bg-white rounded-2xl rounded-tl-md shadow-md border border-gray-100 p-4 max-w-[88%]">
      {children}
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-start gap-2.5 mb-4">
    <img src={agentAvatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-orange-200 flex-shrink-0" />
    <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const ChatOption = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full py-3.5 px-4 rounded-xl text-left font-medium transition-all duration-200 border text-[15px] flex items-center justify-between ${
      isSelected
        ? 'bg-orange-500 text-white border-orange-400 shadow-md'
        : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-orange-50 hover:border-orange-300 active:scale-[0.98]'
    }`}
  >
    <span>{label}</span>
    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
  </button>
);

// ============================================================================
// STEP COMPONENTS
// ============================================================================

const StepSystemType = ({ answers, handleAnswer }: any) => (
  <div>
    <ChatBubble>
      <p className="text-gray-800 font-semibold">Hi! 👋 I help homeowners save up to $3,000 on HVAC projects.</p>
      <p className="text-gray-600 text-sm mt-2">Let me match you with certified pros. What system do you need help with?</p>
    </ChatBubble>
    <div className="ml-[46px] space-y-2">
      {airTypeOptions.map(opt => (
        <ChatOption key={opt.value} label={opt.label} isSelected={answers.air_type === opt.value}
          onClick={() => { handleAnswer('air_type', opt.value); handleAnswer('step', 3); }} />
      ))}
    </div>
    <ChatTestimonial />
  </div>
);

const StepSpecificSystem = ({ answers, handleAnswer }: any) => {
  const options = airSubTypeOptions[answers.air_type || 'Cooling'] || airSubTypeOptions.Cooling;
  return (
    <div>
      <ChatBubble>
        <p className="text-gray-800 font-semibold">Great choice — {answers.air_type?.toLowerCase()}! 👍</p>
        <p className="text-gray-600 text-sm mt-2">What specific type of system do you have or want?</p>
      </ChatBubble>
      <div className="ml-[46px] space-y-2">
        {options.map(opt => (
          <ChatOption key={opt.value} label={opt.label} isSelected={answers.air_sub_type === opt.value}
            onClick={() => { handleAnswer('air_sub_type', opt.value); handleAnswer('step', 4); }} />
        ))}
      </div>
    </div>
  );
};

const StepProjectType = ({ answers, handleAnswer }: any) => (
  <div>
    <ChatBubble>
      <p className="text-gray-800 font-semibold">Perfect — {answers.air_sub_type?.toLowerCase()}. 🔧</p>
      <p className="text-gray-600 text-sm mt-2">What kind of work do you need? This helps us find the best match.</p>
    </ChatBubble>
    <div className="ml-[46px] space-y-2">
      {projectTypeOptions.map(opt => (
        <ChatOption key={opt.value} label={opt.label} isSelected={answers.project_type === opt.value}
          onClick={() => { handleAnswer('project_type', opt.value); handleAnswer('step', 5); }} />
      ))}
    </div>
  </div>
);

const StepService = ({ answers, handleAnswer }: any) => {
  const options = serviceOptions[answers.project_type || 'Repair'] || serviceOptions.Repair;
  return (
    <div>
      <ChatBubble>
        <p className="text-gray-800 font-semibold">Almost there! 🎯 Which specific service do you need?</p>
        <p className="text-gray-600 text-sm mt-1">This ensures we get you the most accurate quote.</p>
      </ChatBubble>
      <div className="ml-[46px] space-y-2">
        {options.map(opt => (
          <ChatOption key={opt.value} label={opt.label} isSelected={answers.service === opt.value}
            onClick={() => { handleAnswer('service', opt.value); handleAnswer('step', 6); }} />
        ))}
      </div>
    </div>
  );
};

const StepHomeOwner = ({ answers, handleAnswer, onNext }: any) => (
  <div>
    <ChatBubble>
      <p className="text-gray-800 font-semibold">Quick verification — are you the homeowner? 🏠</p>
      <p className="text-gray-600 text-sm mt-1">We need to confirm this to proceed with your quote.</p>
    </ChatBubble>
    <div className="ml-[46px] space-y-2">
      <ChatOption label="Yes, I own this home ✓" isSelected={answers.home_owner === 'True'}
        onClick={() => { handleAnswer('home_owner', 'True'); onNext?.(); }} />
      <ChatOption label="No, I don't own it" isSelected={answers.home_owner === 'False'}
        onClick={() => { handleAnswer('home_owner', 'False'); onNext?.(); }} />
    </div>
  </div>
);

const StepAddress = ({ answers, handleAnswer, onNext }: any) => {
  const [addressInput, setAddressInput] = useState(answers.property_address || '');
  const [isAddressSelected, setIsAddressSelected] = useState(!!answers.property_address);
  const [showManual, setShowManual] = useState(false);
  const [mapsLoadFailed, setMapsLoadFailed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
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
          setJustSelected(true);
          setTimeout(() => setJustSelected(false), 400);
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
    <div>
      <ChatBubble>
        <p className="text-gray-800 font-medium">Where's the property? 📍</p>
        <p className="text-gray-600 text-sm mt-1">This helps us find HVAC pros near you.</p>
      </ChatBubble>
      <div className="ml-12">
        {!showManual ? (
          <div className="space-y-2">
            <Input ref={inputRef} placeholder="Start typing your address..." value={addressInput}
              onChange={(e) => { setAddressInput(e.target.value); setIsAddressSelected(false); }}
              className="text-base py-5 border-gray-200 rounded-xl" />
            {!isAddressSelected && addressInput && <p className="text-xs text-orange-500">Select from dropdown</p>}
            <button onClick={() => setShowManual(true)} className="text-xs text-gray-400 underline">Enter manually</button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input placeholder="Street Address" value={manual.street} onChange={(e) => handleManualChange('street', e.target.value)} className="py-4 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" value={manual.city} onChange={(e) => handleManualChange('city', e.target.value)} className="py-4 rounded-xl" />
              <Input placeholder="State" maxLength={2} value={manual.state} onChange={(e) => handleManualChange('state', e.target.value.toUpperCase())} className="py-4 rounded-xl" />
            </div>
            <Input placeholder="ZIP" maxLength={5} value={manual.zip} onChange={(e) => handleManualChange('zip', e.target.value)} className="py-4 rounded-xl" />
            <button onClick={() => setShowManual(false)} className="text-xs text-gray-400 underline">Back to search</button>
          </div>
        )}
        <Button onClick={onNext} disabled={!canProceed || justSelected} className="w-full mt-3 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold">
          Continue <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
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
    <div>
      <ChatBubble>
        <p className="text-gray-800 font-medium">Last step! 🎉 Where should we send your free quotes?</p>
      </ChatBubble>
      <div className="ml-12 bg-white rounded-2xl shadow-md border border-gray-100 p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1">First Name</Label>
              <Input placeholder="John" value={answers.first_name || ''}
                onChange={(e) => handleAnswer('first_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
                className={`py-4 rounded-xl ${errors.first_name ? 'border-red-400' : ''}`} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Last Name</Label>
              <Input placeholder="Doe" value={answers.last_name || ''}
                onChange={(e) => handleAnswer('last_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
                className={`py-4 rounded-xl ${errors.last_name ? 'border-red-400' : ''}`} />
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
              className={`py-4 rounded-xl ${errors.phone_number ? 'border-red-400' : ''}`} />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1">Email</Label>
            <Input type="email" placeholder="john@example.com" value={answers.email || ''}
              onChange={(e) => handleAnswer('email', e.target.value)}
              className={`py-4 rounded-xl ${errors.email ? 'border-red-400' : ''}`} />
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            By clicking "Get My Free Quote" below, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its{' '}
            <a href="/partners" target="_blank" className="text-orange-400 underline">marketing partners</a>, including American Residential Services LLC,
            affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services
            via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone
            dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply.
            Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any
            state or federal Do-Not-Call registry. I have read and agree to the{' '}
            <a href="/privacy" target="_blank" className="text-orange-400 underline">Privacy Policy</a> and{' '}
            <a href="/terms" target="_blank" className="text-orange-400 underline">Terms of Service</a>.
          </p>
          <Button onClick={() => validate() && onSubmit()} disabled={isLoading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
              : <><Send className="h-4 w-4" /> Get My Free Quotes</>}
          </Button>
          <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Your info is secure & never shared without consent
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HVACLanderB() {
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
    const el = document.getElementById('leadid_token') as HTMLInputElement;
    if (el?.value) return el.value;
    return '';
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
      tcpa_text: 'By clicking "Get My Free Quote" below, I consent and provide my electronic signature as express written consent for FamilyOwnedContractors.com and up to 4 of its marketing partners, including American Residential Services LLC, affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any state or federal Do-Not-Call registry. I have read and agree to the Privacy Policy and Terms of Service.',
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set! 🎉</h2>
          <p className="text-gray-600 mb-4">A certified HVAC pro will call you within 15 minutes.</p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-sm text-orange-800">📞 Keep your phone nearby!</p>
          </div>
        </div>
      </div>
    );
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

      {/* Progress with step count */}
      <div className="container mx-auto px-4 pt-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: actualTotalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentStep ? 'w-6 bg-orange-500' : i === currentStep ? 'w-6 bg-orange-300' : 'w-3 bg-gray-200'
              }`} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">Step {Math.min(currentStep, actualTotalSteps)}/{actualTotalSteps}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-6">
        <div className="max-w-lg mx-auto">
          {renderStep()}
          <TrustBadgesB />
        </div>
      </div>

      <footer className="mt-auto pt-4 pb-4 border-t border-gray-100">
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
