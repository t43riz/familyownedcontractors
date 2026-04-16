/**
 * Call-Driven HVAC Landing Page
 * - Same visual style as HVACLander.tsx
 * - CTA is a click-to-call number swapped by Sparrow DNI (Edge Inject)
 * - Captures Jornaya LeadiD + TrustedForm cert URL on click and attaches
 *   them as tags/custom data so Sparrow associates them with the click event.
 */
import { useEffect } from 'react';
import { Phone, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import {
  AnimatedCard,
  SocialProof,
  ComplianceFooter,
} from './SharedFormComponents';

const SPARROW_POOL_ID = '60e43fb0-9500-4205-9a9f-b4a6b3056077';
const SPARROW_SNIPPET_SRC =
  'https://sparrow-dni.propelsys.workers.dev/dni/sparrow-dni.min.js';
const DEFAULT_PHONE_DISPLAY = '1-800-555-0000';
const DEFAULT_PHONE_TEL = '+18005550000';

declare global {
  interface Window {
    SparrowDNI?: {
      setTags?: (tags: Record<string, unknown>) => void;
      tag?: (tags: Record<string, unknown>) => void;
    };
    __sparrow_cb?: {
      tags?: Record<string, unknown>;
      result?: { number?: string; formatted?: string; session_id?: string };
    };
  }
}

export default function HVACLanderCall() {
  // --- Inject the Sparrow DNI snippet once on mount ---
  useEffect(() => {
    if (document.querySelector(`script[data-sparrow-pool="${SPARROW_POOL_ID}"]`)) return;
    const s = document.createElement('script');
    s.src = SPARROW_SNIPPET_SRC;
    s.async = true;
    s.setAttribute('data-sparrow-pool', SPARROW_POOL_ID);
    document.head.appendChild(s);
  }, []);

  // --- Build the tags object from compliance inputs + push to DNI ---
  useEffect(() => {
    const getTokens = () => {
      const leadIdEl = document.getElementById('leadid_token') as HTMLInputElement | null;
      const tfEl = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement | null;
      return {
        jornaya_leadid: leadIdEl?.value || '',
        trustedform_cert_url: tfEl?.value || '',
        landing_page: window.location.href,
        service: 'hvac',
        page: 'hvac-call',
      };
    };

    const applyTags = () => {
      const tags = getTokens();

      // 1) Preferred: snippet's own API if present
      if (window.SparrowDNI?.setTags) window.SparrowDNI.setTags(tags);
      else if (window.SparrowDNI?.tag) window.SparrowDNI.tag(tags);

      // 2) Fallback: stash on the shared callback object the snippet reads
      if (window.__sparrow_cb) {
        window.__sparrow_cb.tags = { ...(window.__sparrow_cb.tags || {}), ...tags };
      }

      // 3) Fallback: expose via attribute on the phone element(s)
      const targets = document.querySelectorAll<HTMLElement>(
        '[data-sparrow-phone], [data-sparrow-number]'
      );
      try {
        const serialized = JSON.stringify(tags);
        targets.forEach((el) => el.setAttribute('data-sparrow-tags', serialized));
      } catch {
        /* ignore serialization errors */
      }
    };

    // Run now, and keep refreshing while tokens populate (up to ~10s)
    let attempts = 0;
    applyTags();
    const interval = window.setInterval(() => {
      attempts += 1;
      applyTags();
      if (attempts >= 20) window.clearInterval(interval);
    }, 500);

    // Ensure tags are attached *before* the DNI click beacon fires
    const onPhoneInteract = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest(
        'a[href^="tel:"], [data-sparrow-phone], [data-sparrow-number]'
      );
      if (!anchor) return;
      applyTags();
    };
    document.addEventListener('mousedown', onPhoneInteract, true);
    document.addEventListener('click', onPhoneInteract, true);
    document.addEventListener('touchstart', onPhoneInteract, true);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('mousedown', onPhoneInteract, true);
      document.removeEventListener('click', onPhoneInteract, true);
      document.removeEventListener('touchstart', onPhoneInteract, true);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hidden compliance inputs — populated by the global Jornaya / TrustedForm scripts in index.html */}
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      <input id="xxTrustedFormCertUrl" name="xxTrustedFormCertUrl" type="hidden" />

      {/* Header (matches HVACLander) */}
      <header className="border-b border-border/60 bg-white sticky top-0 z-50 shadow-custom-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-center">
          <a href="/" className="flex flex-col items-center gap-1">
            <img src="/FOC_less_logo.svg" alt="Family Owned Contractors" className="h-8 sm:h-10 w-auto" />
            <img src="/FOC_name_logo.svg" alt="Family Owned Contractors" className="h-4 sm:h-6 w-auto" />
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <AnimatedCard>
            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs sm:text-sm font-semibold mb-3">
                <Clock className="h-4 w-4" /> Available Now · 24/7 Support
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                Speak With a Local HVAC Pro Right Now
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                AC repair, heating service, installs &amp; more — get matched with a licensed technician in minutes.
              </p>
            </div>

            {/* Big Tap-to-Call CTA
                NOTE: Sparrow DNI replaces the innerHTML of any element with
                [data-sparrow-phone]. To keep the button layout intact, we put
                that attribute on ONLY the inner number span, not the whole
                anchor. We also sync the anchor href from the swapped number
                on click, so the tel: link always matches what's visible. */}
            <a
              href={`tel:${DEFAULT_PHONE_TEL}`}
              aria-label={`Tap to call ${DEFAULT_PHONE_DISPLAY}`}
              onClick={(e) => {
                const el = e.currentTarget.querySelector<HTMLElement>('[data-sparrow-phone], [data-sparrow-number]');
                const swapped =
                  el?.getAttribute('data-sparrow-number') ||
                  el?.textContent?.trim() ||
                  '';
                const digits = swapped.replace(/\D/g, '');
                if (digits) e.currentTarget.setAttribute('href', `tel:+${digits.length === 10 ? '1' + digits : digits}`);
              }}
              className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green to-brand-green/80 text-white shadow-[0_12px_30px_-10px_rgba(22,163,74,0.55)] hover:shadow-[0_18px_40px_-10px_rgba(22,163,74,0.7)] ring-1 ring-brand-green/60 hover:ring-2 active:scale-[0.995] transition-all duration-200"
            >
              {/* subtle shine */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />

              <div className="relative flex items-center justify-center gap-3 sm:gap-4 px-4 py-4 sm:py-5">
                <span className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                  {/* pulsing live indicator */}
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                  </span>
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                    Tap to Call
                  </span>
                  {/* DNI swap target — isolated so it only replaces the number */}
                  <span
                    data-sparrow-phone
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums"
                  >
                    {DEFAULT_PHONE_DISPLAY}
                  </span>
                </div>
              </div>

              <div className="relative border-t border-white/15 bg-black/10 px-4 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide text-white/90">
                Licensed pros · No obligation · Calls answered 24/7
              </div>
            </a>

            {/* Secondary benefits row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
              {[
                { Icon: CheckCircle, label: 'Fast quotes' },
                { Icon: ShieldCheck, label: 'Licensed & insured' },
                { Icon: Clock, label: 'Fast response' },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-white/60 px-2 py-3 text-center shadow-sm sm:flex-row sm:gap-2 sm:py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] sm:text-sm font-semibold text-foreground leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-6 sm:mt-8 bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-foreground mb-2">How it works</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Tap the number above to call.</li>
                <li>We match you with a local HVAC specialist.</li>
                <li>Schedule your visit and get your estimate.</li>
              </ol>
            </div>

            {/* TCPA disclosure for calls */}
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-relaxed mt-5">
              By calling the number above, you consent to be connected with a licensed HVAC
              contractor or one of FamilyOwnedContractors.com&apos;s marketing partners. Calls
              may be recorded for quality and compliance. See our{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                Terms of Service
              </a>.
            </p>
          </AnimatedCard>

          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />
        </div>
      </div>
    </div>
  );
}
