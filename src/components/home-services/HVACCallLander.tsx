/**
 * HVAC Call-Only Lander — v2
 * Click-to-call variant with red+blue scheme and "Contractors Compete. You Save."
 * Ports the Sparrow DNI / Jornaya / TrustedForm / call-click-optin wiring from
 * HVACLanderCall.tsx so call attribution and TCPA opt-in logging work identically.
 */
import { useEffect, useState } from 'react';
import { Phone, Clock } from 'lucide-react';
import { ComplianceFooter, SocialProof } from './SharedFormComponents';

// Fallback placeholder (matches the seed in index.html). Edge Inject rewrites
// the shell anchor server-side; the client snippet updates it if Edge Inject
// didn't run. Either way the component reads the resolved number from
// window.__sparrow_cb.result or the shell anchor on mount.
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
    __sparrow_edge_injected?: boolean;
  }
}

function digitsToTel(input: string | undefined | null): string {
  const digits = (input || '').replace(/\D/g, '');
  if (!digits) return '';
  return `tel:+${digits.length === 10 ? '1' + digits : digits}`;
}

function readSparrowNumber(): { display: string; tel: string } | null {
  const cb = window.__sparrow_cb?.result;
  if (cb?.formatted || cb?.number) {
    const display = cb.formatted || cb.number || '';
    const tel = digitsToTel(cb.number || cb.formatted);
    if (display && tel) return { display, tel };
  }
  const shell = document.querySelector<HTMLAnchorElement>(
    '#sparrow-dni-shell a[data-sparrow-phone], #sparrow-dni-shell a[data-sparrow-number]'
  );
  if (shell) {
    const display = shell.getAttribute('data-sparrow-number') || shell.textContent?.trim() || '';
    const tel = shell.getAttribute('href') || digitsToTel(display);
    if (display && tel && !display.startsWith('1-800-555-0000')) return { display, tel };
  }
  return null;
}

export default function HVACCallLander() {
  const [phone, setPhone] = useState<{ display: string; tel: string }>(() => ({
    display: DEFAULT_PHONE_DISPLAY,
    tel: `tel:${DEFAULT_PHONE_TEL}`,
  }));

  // Sync displayed number with whatever Sparrow (Edge Inject or snippet) resolved
  useEffect(() => {
    const apply = () => {
      const resolved = readSparrowNumber();
      if (resolved) setPhone(resolved);
    };
    apply();

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      apply();
      if (attempts >= 40) window.clearInterval(interval);
    }, 250);

    const shell = document.getElementById('sparrow-dni-shell');
    let observer: MutationObserver | undefined;
    if (shell) {
      observer = new MutationObserver(apply);
      observer.observe(shell, { attributes: true, childList: true, subtree: true, characterData: true });
    }

    return () => {
      window.clearInterval(interval);
      observer?.disconnect();
    };
  }, []);

  // Attach Jornaya / TrustedForm tags to DNI + fire call-click optin
  useEffect(() => {
    const getTokens = () => {
      const leadIdEl = document.getElementById('leadid_token') as HTMLInputElement | null;
      const tfEl = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement | null;
      return {
        jornaya_leadid: leadIdEl?.value || '',
        trustedform_cert_url: tfEl?.value || '',
        landing_page: window.location.href,
        service: 'hvac',
        page: 'hvac-call-v2',
      };
    };

    const applyTags = () => {
      const tags = getTokens();
      if (window.SparrowDNI?.setTags) window.SparrowDNI.setTags(tags);
      else if (window.SparrowDNI?.tag) window.SparrowDNI.tag(tags);

      if (window.__sparrow_cb) {
        window.__sparrow_cb.tags = { ...(window.__sparrow_cb.tags || {}), ...tags };
      }

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

    let attempts = 0;
    applyTags();
    const interval = window.setInterval(() => {
      attempts += 1;
      applyTags();
      if (attempts >= 20) window.clearInterval(interval);
    }, 500);

    let optinFired = false;
    const fireOptin = () => {
      if (optinFired) return;
      const tokens = getTokens();
      const params = new URLSearchParams(window.location.search);
      const queryParams: Record<string, string> = {};
      params.forEach((value, key) => {
        queryParams[key] = value;
      });
      const phoneEl = document.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
      const phoneTel = phoneEl?.getAttribute('href') || '';
      const phoneDisplay = phoneEl?.textContent?.trim() || '';
      const sparrowSessionId = window.__sparrow_cb?.result?.session_id || null;

      const payload = {
        txid: queryParams['txid'] || null,
        service: 'hvac',
        page: 'hvac-call-v2',
        phone_dialed: phoneTel.replace(/^tel:/, '') || null,
        phone_display: phoneDisplay || null,
        jornaya_leadid: tokens.jornaya_leadid || null,
        trustedform_cert_url: tokens.trustedform_cert_url || null,
        landing_page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        query_params: queryParams,
        sparrow_session_id: sparrowSessionId,
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const ok = navigator.sendBeacon?.('/api/call-click-optin', blob);
        if (!ok) {
          fetch('/api/call-click-optin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {
            /* ignore */
          });
        }
        optinFired = true;
      } catch {
        /* ignore */
      }
    };

    const onPhoneInteract = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest(
        'a[href^="tel:"], [data-sparrow-phone], [data-sparrow-number]'
      );
      if (!anchor) return;
      applyTags();
      fireOptin();
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
      {/* Hidden compliance inputs — populated by Jornaya / TrustedForm scripts in index.html */}
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      <input id="xxTrustedFormCertUrl" name="xxTrustedFormCertUrl" type="hidden" />

      <header className="border-b border-border/60 bg-white sticky top-0 z-50 shadow-custom-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-center">
          <a href="/" className="flex flex-col items-center gap-1">
            <img src="/FOC_less_logo.svg" alt="Family Owned Contractors" className="h-11 sm:h-12 w-auto" />
            <img src="/FOC_name_logo.svg" alt="Family Owned Contractors" className="h-6 sm:h-7 w-auto" />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 sm:py-8">
        <div className="max-w-xl mx-auto">
          {/* Hero */}
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy leading-[1.05] tracking-tight">
              Contractors Compete. <span className="text-red-600">You Save.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-foreground/80 leading-snug">
              Speak with a local HVAC pro <span className="font-semibold text-foreground">for free</span>.
              Have contractors <span className="font-semibold text-foreground">compete for your installation</span> and
              potentially <span className="font-semibold text-foreground">lower your price</span>. AC repair,
              heating service, installs &amp; more — get matched with a <span className="font-semibold text-foreground">licensed technician</span> in a free, quick call.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              <span className="text-sm font-semibold text-red-700">Available now · 24/7 Support</span>
            </div>
          </section>

          {/* CTA — only the inner phone-number <span> carries data-sparrow-phone, so the
              Sparrow snippet swaps THAT span's textContent (and the anchor's tel: href via
              its own querySelectorAll('a[href^="tel:"]') pass) without nuking the icon or
              "Call Now for FREE" label. */}
          <a
            href={phone.tel}
            aria-label={`Tap to call ${phone.display}`}
            className="group mt-5 sm:mt-6 block rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-button ring-1 ring-red-700/20 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <div className="flex flex-col items-center justify-center gap-0.5 px-5 py-3.5 sm:py-4 text-white">
              <span className="flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold tracking-tight uppercase">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                Call Now for FREE
              </span>
              <span
                data-sparrow-phone
                className="text-base sm:text-lg font-semibold text-white/90 tabular-nums"
              >
                {phone.display}
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
              <a href="/partners" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-navy">marketing partners</a>,
              including American Residential Services LLC, affiliated home service companies and their
              partners, and parties acting on their behalf, to contact me for marketing and telemarketing
              purposes regarding home improvement services via phone calls and text messages at the number
              I dial or that is dialed for me, including calls or texts placed using an automatic telephone
              dialing system or an artificial or prerecorded voice. I understand that my consent is{' '}
              <span className="font-semibold">not a condition</span> of purchasing any goods or services.
              Message and data rates may apply. Message frequency may vary. Text HELP for assistance or
              STOP to opt out. My consent applies even if my number is on any state or federal Do-Not-Call
              registry. Calls may be recorded for quality and compliance. I have read and agree to the{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-navy">Privacy Policy</a> and{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-navy">Terms of Service</a>.
            </p>
          </section>

          <SocialProof serviceName="homeowners" />
          <ComplianceFooter />
        </div>
      </main>
    </div>
  );
}
