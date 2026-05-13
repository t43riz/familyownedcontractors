/**
 * HVAC Call-Only Lander
 * Click-to-call variant — red + blue scheme, "Contractors Compete. You Save."
 */
import React from 'react';
import { Phone, Clock, CheckCircle } from 'lucide-react';
import { ComplianceFooter, SocialProof } from './SharedFormComponents';

// Replace with the buyer phone number for this campaign.
const PHONE_DISPLAY = '(855) 555-0142';
const PHONE_TEL = '+18555550142';

export default function HVACCallLander() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b border-border/60 bg-white sticky top-0 z-50 shadow-custom-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-center">
          <a href="/" className="flex flex-col items-center gap-1">
            <img src="/FOC_less_logo.svg" alt="Family Owned Contractors" className="h-8 sm:h-10 w-auto" />
            <img src="/FOC_name_logo.svg" alt="Family Owned Contractors" className="h-4 sm:h-6 w-auto" />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-xl mx-auto">
          {/* Hero */}
          <section className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy leading-tight tracking-tight">
              Contractors Compete. <span className="text-red-600">You Save.</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-foreground/80 leading-snug">
              Speak with a local HVAC pro for free. Have contractors compete for your installation
              and potentially lower your price. AC repair, heating service, installs &amp; more —
              get matched with a licensed technician in a free, quick call.
            </p>

            {/* Availability badge — now red */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-xs font-semibold text-red-700">Available now · 24/7 Support</span>
            </div>
          </section>

          {/* CTA Button */}
          <a
            href={`tel:${PHONE_TEL}`}
            aria-label={`Call now for free at ${PHONE_DISPLAY}`}
            className="group mt-4 block rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-button ring-1 ring-red-700/20 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <div className="flex flex-col items-center justify-center gap-0.5 px-5 py-3.5 sm:py-4 text-white">
              <span className="flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold tracking-tight uppercase">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                Call Now for FREE
              </span>
              <span className="text-base sm:text-lg font-semibold text-white/90 tabular-nums">
                {PHONE_DISPLAY}
              </span>
            </div>
          </a>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            Tap the above number to call for free
          </p>

          {/* How it works */}
          <section className="mt-4 rounded-xl border border-brand-blue/15 bg-white p-3.5 sm:p-4 shadow-custom-sm">
            <h2 className="text-sm sm:text-base font-bold text-brand-navy mb-2.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-blue" />
              How it works
            </h2>
            <ol className="space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-xs">
                  1
                </span>
                <div className="leading-snug">
                  <p className="text-sm font-semibold text-foreground">Tap the number above</p>
                  <p className="text-xs text-muted-foreground">Free, fast — connects you in seconds.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-xs">
                  2
                </span>
                <div className="leading-snug">
                  <p className="text-sm font-semibold text-foreground">Speak with a local HVAC pro</p>
                  <p className="text-xs text-muted-foreground">
                    Get matched with a licensed technician.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* TCPA / consent — de-emphasized */}
          <section className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-[10px] leading-snug text-muted-foreground/80">
              By tapping <span className="font-semibold">CALL NOW</span> above, I agree and provide my electronic signature as
              express written consent for FamilyOwnedContractors.com and up to 4 of its{' '}
              <a href="/partners" className="underline hover:text-brand-navy">marketing partners</a>,
              including American Residential Services LLC, affiliated home service companies and their
              partners, and parties acting on their behalf, to contact me for marketing and telemarketing
              purposes regarding home improvement services via phone calls and text messages at the number
              I dial or that is dialed for me, including calls or texts placed using an automatic telephone
              dialing system or an artificial or prerecorded voice. I understand that my consent is{' '}
              <span className="font-semibold">not a condition</span> of purchasing any goods or services.
              Message and data rates may apply. Message frequency may vary. Text HELP for assistance or
              STOP to opt out. My consent applies even if my number is on any state or federal Do-Not-Call
              registry. Calls may be recorded for quality and compliance. I have read and agree to the{' '}
              <a href="/privacy" className="underline hover:text-brand-navy">Privacy Policy</a> and{' '}
              <a href="/terms" className="underline hover:text-brand-navy">Terms of Service</a>.
            </p>
          </section>

          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />
        </div>
      </main>
    </div>
  );
}
