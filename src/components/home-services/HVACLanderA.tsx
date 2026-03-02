/**
 * HVAC Lander Variation A — "Dark Urgency" Theme
 * Expert-optimized for paid social mobile traffic
 * 
 * CRO features:
 * - Dark gradient background with warm amber/orange accents
 * - Live activity badge (social proof)
 * - Rotating micro-testimonials
 * - Percentage progress bar with context messages
 * - Bold option buttons with icons
 * - Risk-reversal messaging throughout
 * - Authority signals (BBB, 10k+ projects)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import {
  Thermometer, Home, Wrench, Fan, Flame, Shield, CheckCircle, MapPin,
  User, Phone, Mail, ChevronRight, Lock, Star, Zap, Clock, Users, BadgeCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { decodeLeadData, hasContactInfo, hasAddressInfo, LeadData } from '@/utils/leadDataHandoff';
import { submitHomeServicesLead } from '@/services/homeServicesApi';

// ============================================================================
// CONSTANTS (identical form options)
// ============================================================================

const TOTAL_STEPS = 7;

const airTypeOptions = [
  { label: 'Cooling (AC)', value: 'Cooling', icon: <Fan className="h-5 w-5" /> },
  { label: 'Heating', value: 'Heating', icon: <Flame className="h-5 w-5" /> },
  { label: 'Both Heating & Cooling', value: 'Heating and Cooling', icon: <Thermometer className="h-5 w-5" /> }
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
  { label: 'Repair', value: 'Repair', icon: <Wrench className="h-5 w-5" /> },
  { label: 'New Unit Installed', value: 'New Unit Installed', icon: <Zap className="h-5 w-5" /> },
  { label: 'Install', value: 'Install', icon: <Zap className="h-5 w-5" /> },
  { label: 'Replace', value: 'Replace', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Service', value: 'Service', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Maintenance', value: 'Maintenance', icon: <Shield className="h-5 w-5" /> },
  { label: 'Cleaning', value: 'Cleaning', icon: <Fan className="h-5 w-5" /> },
  { label: 'Upgrade', value: 'Upgrade', icon: <Star className="h-5 w-5" /> }
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
// CRO COMPONENTS
// ============================================================================

const LiveActivityBadge = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(Math.floor(Math.random() * 8) + 12);
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(8, Math.min(25, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1.5 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-green-300 font-medium">{count} homeowners online now</span>
    </div>
  );
};

const testimonials = [
  { name: "Mike R.", location: "Phoenix, AZ", text: "Got 3 quotes in one day. Saved $2,400 on my new AC unit!" },
  { name: "Sarah K.", location: "Dallas, TX", text: "The technician they matched me with was incredible. Fixed my furnace same day." },
  { name: "James T.", location: "Atlanta, GA", text: "Best decision ever. New heat pump installed for way less than I expected." },
  { name: "Linda M.", location: "Denver, CO", text: "Quick, easy process. Had my HVAC serviced within 48 hours." },
];

const MicroTestimonial = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = testimonials[idx];
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-4 transition-all duration-500">
      <div className="flex items-center gap-1 mb-1">
        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
      </div>
      <p className="text-white/80 text-xs italic">"{t.text}"</p>
      <p className="text-white/50 text-xs mt-1">— {t.name}, {t.location}</p>
    </div>
  );
};

const ProgressBarA = ({ step, total }: { step: number; total: number }) => {
  const pct = Math.round((step / total) * 100);
  const messages: Record<number, string> = {
    2: "Let's find your perfect match...",
    3: "Great choice! Almost there...",
    4: "You're doing great!",
    5: "Just a few more details...",
    6: "Verifying eligibility...",
    7: "Final step — lock in your quote!",
  };
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-white/60 font-medium">{pct}% Complete</span>
        <span className="text-xs text-amber-400/80">{messages[step] || ''}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const AuthorityBadges = () => (
  <div className="flex items-center justify-center gap-4 mt-4 opacity-60">
    <div className="flex items-center gap-1 text-xs text-white/70">
      <BadgeCheck className="h-4 w-4 text-amber-400" />
      <span>BBB Accredited</span>
    </div>
    <div className="flex items-center gap-1 text-xs text-white/70">
      <Users className="h-4 w-4 text-amber-400" />
      <span>50,000+ Projects</span>
    </div>
    <div className="flex items-center gap-1 text-xs text-white/70">
      <Shield className="h-4 w-4 text-amber-400" />
      <span>Licensed Pros</span>
    </div>
  </div>
);

const DarkCard = ({ children }: { children: React.ReactNode }) => (
  <Card className="p-5 sm:p-6 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-white/10 shadow-2xl max-w-xl mx-auto relative overflow-hidden backdrop-blur-sm">
    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
    <div className="relative z-10">{children}</div>
  </Card>
);

const DarkOptionButton = ({ label, icon, isSelected, onClick }: {
  label: string; icon?: React.ReactNode; isSelected: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full py-4 px-4 rounded-xl text-left font-semibold transition-all duration-200 flex items-center gap-3 border ${
      isSelected
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
        : 'bg-white/5 text-white/90 border-white/10 hover:bg-white/10 hover:border-amber-500/40 active:scale-[0.98]'
    }`}
  >
    {icon && <span className={isSelected ? 'text-white' : 'text-amber-400'}>{icon}</span>}
    <span className="text-base">{label}</span>
    <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
  </button>
);

// ============================================================================
// STEP COMPONENTS
// ============================================================================

const StepSystemType = ({ answers, handleAnswer }: any) => (
  <DarkCard>
    <div className="text-center mb-5">
      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
        <Thermometer className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">What System Do You Need Help With?</h2>
      <p className="text-sm text-white/60">We'll match you with certified HVAC pros in your area</p>
    </div>
    <div className="space-y-2.5">
      {airTypeOptions.map(opt => (
        <DarkOptionButton
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          isSelected={answers.air_type === opt.value}
          onClick={() => { handleAnswer('air_type', opt.value); handleAnswer('step', 3); }}
        />
      ))}
    </div>
    <div className="text-center mt-4">
      <p className="text-xs text-white/40 flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" /> No obligation • 100% free quotes
      </p>
    </div>
  </DarkCard>
);

const StepSpecificSystem = ({ answers, handleAnswer }: any) => {
  const options = airSubTypeOptions[answers.air_type || 'Cooling'] || airSubTypeOptions.Cooling;
  const icon = answers.air_type === 'Heating' ? <Flame className="h-7 w-7 text-white" /> : <Fan className="h-7 w-7 text-white" />;
  return (
    <DarkCard>
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">What Type of System?</h2>
        <p className="text-sm text-white/60">This helps us find the right specialist</p>
      </div>
      <div className="space-y-2.5">
        {options.map(opt => (
          <DarkOptionButton
            key={opt.value}
            label={opt.label}
            isSelected={answers.air_sub_type === opt.value}
            onClick={() => { handleAnswer('air_sub_type', opt.value); handleAnswer('step', 4); }}
          />
        ))}
      </div>
      <div className="text-center mt-4">
        <p className="text-xs text-white/40 flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" /> All contractors are licensed & insured
        </p>
      </div>
    </DarkCard>
  );
};

const StepProjectType = ({ answers, handleAnswer }: any) => (
  <DarkCard>
    <div className="text-center mb-5">
      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
        <Wrench className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">What Do You Need Done?</h2>
      <p className="text-sm text-white/60">Select the type of work required</p>
    </div>
    <div className="space-y-2">
      {projectTypeOptions.map(opt => (
        <DarkOptionButton
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          isSelected={answers.project_type === opt.value}
          onClick={() => { handleAnswer('project_type', opt.value); handleAnswer('step', 5); }}
        />
      ))}
    </div>
  </DarkCard>
);

const StepService = ({ answers, handleAnswer }: any) => {
  const options = serviceOptions[answers.project_type || 'Repair'] || serviceOptions.Repair;
  return (
    <DarkCard>
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Specific Service Needed</h2>
        <p className="text-sm text-white/60">Help us get you the most accurate quote</p>
      </div>
      <div className="space-y-2.5">
        {options.map(opt => (
          <DarkOptionButton
            key={opt.value}
            label={opt.label}
            isSelected={answers.service === opt.value}
            onClick={() => { handleAnswer('service', opt.value); handleAnswer('step', 6); }}
          />
        ))}
      </div>
    </DarkCard>
  );
};

const StepHomeOwner = ({ answers, handleAnswer, onNext }: any) => (
  <DarkCard>
    <div className="text-center mb-5">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
        <Home className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">Are You the Homeowner?</h2>
      <p className="text-sm text-white/60">We need to confirm property ownership</p>
    </div>
    <div className="space-y-2.5">
      <DarkOptionButton
        label="Yes, I Own This Home"
        icon={<CheckCircle className="h-5 w-5" />}
        isSelected={answers.home_owner === 'True'}
        onClick={() => { handleAnswer('home_owner', 'True'); onNext?.(); }}
      />
      <DarkOptionButton
        label="No, I Don't Own It"
        isSelected={answers.home_owner === 'False'}
        onClick={() => { handleAnswer('home_owner', 'False'); onNext?.(); }}
      />
    </div>
  </DarkCard>
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
    <DarkCard>
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
          <MapPin className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Where's the Property?</h2>
        <p className="text-sm text-white/60">We'll match you with contractors near you</p>
      </div>
      {!showManual ? (
        <div className="space-y-3">
          <Input ref={inputRef} placeholder="Start typing your address..." value={addressInput}
            onChange={(e) => { setAddressInput(e.target.value); setIsAddressSelected(false); }}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-base py-5"
          />
          {!isAddressSelected && addressInput && <p className="text-xs text-amber-400/80">Select from dropdown</p>}
          <button onClick={() => setShowManual(true)} className="text-xs text-white/40 underline hover:text-white/60 block mx-auto">
            Enter address manually
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input placeholder="Street Address" value={manual.street} onChange={(e) => handleManualChange('street', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" value={manual.city} onChange={(e) => handleManualChange('city', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5" />
            <Input placeholder="State" maxLength={2} value={manual.state} onChange={(e) => handleManualChange('state', e.target.value.toUpperCase())}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5" />
          </div>
          <Input placeholder="ZIP Code" maxLength={5} value={manual.zip} onChange={(e) => handleManualChange('zip', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5" />
          <button onClick={() => setShowManual(false)} className="text-xs text-white/40 underline hover:text-white/60 block mx-auto">
            Back to address search
          </button>
        </div>
      )}
      <Button onClick={onNext} disabled={!canProceed}
        className="w-full mt-4 py-5 text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25">
        Continue <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </DarkCard>
  );
};

const StepContact = ({ answers, handleAnswer, onSubmit, isLoading }: any) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!answers.first_name?.trim() || answers.first_name.trim().length < 2) e.first_name = 'First name required';
    if (!answers.last_name?.trim() || answers.last_name.trim().length < 2) e.last_name = 'Last name required';
    const phone = (answers.phone_number || '').replace(/\D/g, '');
    if (phone.length !== 10) e.phone_number = 'Valid 10-digit phone required';
    if (!answers.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <DarkCard>
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
          <CheckCircle className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Get Your Free HVAC Quote!</h2>
        <p className="text-sm text-white/60">A certified specialist will call you shortly</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5">
        <p className="text-sm font-semibold text-amber-300 text-center">🔥 Compare quotes from top-rated local HVAC pros</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-white/70 text-xs mb-1 flex items-center gap-1"><User className="h-3 w-3" /> First Name</Label>
            <Input placeholder="John" value={answers.first_name || ''}
              onChange={(e) => handleAnswer('first_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5 ${errors.first_name ? 'border-red-500' : ''}`} />
            {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <Label className="text-white/70 text-xs mb-1">Last Name</Label>
            <Input placeholder="Doe" value={answers.last_name || ''}
              onChange={(e) => handleAnswer('last_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50))}
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5 ${errors.last_name ? 'border-red-500' : ''}`} />
            {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name}</p>}
          </div>
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
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
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5 ${errors.phone_number ? 'border-red-500' : ''}`} />
          {errors.phone_number && <p className="text-xs text-red-400 mt-1">{errors.phone_number}</p>}
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
          <Input type="email" placeholder="john@example.com" value={answers.email || ''}
            onChange={(e) => handleAnswer('email', e.target.value)}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-5 ${errors.email ? 'border-red-500' : ''}`} />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <p className="text-[10px] text-white/30 leading-relaxed mt-3">
          By submitting, I consent and provide my electronic signature as express written consent for SellingProperty.net and up to 4 of its{' '}
          <a href="/partners" target="_blank" className="text-amber-400/50 underline">marketing partners</a>, including American Residential Services LLC,
          affiliated home service companies and their partners, and parties acting on their behalf to contact me regarding home improvement services
          via email, text, or phone calls at the number and email I provided. This contact may include the use of automated or automatic telephone
          dialing systems, prerecorded or artificial voice messages, and/or artificial technology. Message and data rates may apply.
          Message frequency may vary. Text HELP for assistance or STOP to opt out. My consent applies even if my number is registered on any
          state or federal Do-Not-Call registry. I have read and agree to the{' '}
          <a href="/privacy" target="_blank" className="text-amber-400/50 underline">Privacy Policy</a> and{' '}
          <a href="/terms" target="_blank" className="text-amber-400/50 underline">Terms of Service</a>.
        </p>

        <Button onClick={() => validate() && onSubmit()} disabled={isLoading}
          className="w-full py-5 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 mt-2">
          {isLoading ? (
            <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></div>
          ) : 'Get My Free Quote →'}
        </Button>

        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-white/30">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 256-bit encrypted</span>
          <span>•</span>
          <span>No spam, ever</span>
        </div>
      </div>
    </DarkCard>
  );
};

// ============================================================================
// SUCCESS SCREEN
// ============================================================================

const SuccessScreenA = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <DarkCard>
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-500/30">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">🎉 You're All Set!</h2>
        <p className="text-white/70 mb-4">Your request has been matched with top-rated HVAC pros in your area.</p>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-amber-300 mb-1">📞 Expect a Call Within 15 Minutes</h3>
          <p className="text-sm text-amber-200/70">Keep your phone nearby — your specialist is being assigned now.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <ul className="text-sm text-white/60 space-y-2 text-left">
            <li>📝 Reviewing your details (in progress)</li>
            <li>📞 Quick call to confirm your needs</li>
            <li>🏠 Get your free quote — no obligation</li>
          </ul>
        </div>
      </div>
    </DarkCard>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HVACLanderA() {
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

  // Monitor compliance tokens
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
    const inputs = document.querySelectorAll('input[name*="leadid"], input[id*="leadid"]');
    for (const i of inputs) { const v = (i as HTMLInputElement).value?.trim(); if (v) return v; }
    const hidden = document.querySelectorAll('input[type="hidden"]');
    for (const i of hidden) { const v = (i as HTMLInputElement).value?.trim(); if (v && /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i.test(v)) return v; }
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
      first_name: answers.first_name || '',
      last_name: answers.last_name || '',
      phone: (answers.phone_number || '').replace(/\D/g, ''),
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
      tcpa_text: 'By clicking the button, I agree to receive calls and texts at the number provided about my project. I understand that my consent is not required to make a purchase.',
      jornaya_leadid: getLeadIdToken(),
      trustedform_cert_url: getTrustedFormCert(),
      query_parameters: queryParams,
      original_lead_id: prefilledData?.lead_id,
    };
    try {
      const result = await submitHomeServicesLead(payload, 'hvac');
      if (result.success) { setIsSubmitted(true); }
      else { toast({ title: "Error", description: result.error || "Failed to submit. Please try again.", variant: "destructive", duration: 5000 }); }
    } catch (error) {
      console.error('Error submitting HVAC lead:', error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive", duration: 5000 });
    } finally { setIsLoading(false); }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: handleAnswer('step', 2); return null; // skip property type (hardcoded Residential)
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

  if (isSubmitted) return <SuccessScreenA />;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">HVAC Quotes</span>
          </div>
          <LiveActivityBadge />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <ProgressBarA step={currentStep} total={actualTotalSteps} />
          {renderStep()}
          <MicroTestimonial />
          <AuthorityBadges />

          {/* Compliance footer */}
          <footer className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center space-y-3">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-white/30">
                <a href="/privacy" target="_blank" className="hover:text-white/60 hover:underline">Privacy Policy</a>
                <span>|</span>
                <a href="/terms" target="_blank" className="hover:text-white/60 hover:underline">Terms of Service</a>
                <span>|</span>
                <a href="/do-not-sell" target="_blank" className="hover:text-white/60 hover:underline">Do Not Sell My Info</a>
              </div>
              <p className="text-xs text-white/20">© {new Date().getFullYear()} SellingProperty.net. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </form>
  );
}
