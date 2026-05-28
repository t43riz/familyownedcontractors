/**
 * HVAC Call-Only Lander — v3 (ZIP-gated)
 * Same visual as v2 (red+blue "Contractors Compete. You Save.") but the
 * click-to-call CTA is hidden until the visitor enters a US ZIP code.
 *
 * On ZIP submit we:
 *   1. Persist ZIP in sessionStorage (foc_hvac_call_v3_zip).
 *   2. Call window.Sparrow.setTag('zip', zip) so any new sessions pick it up.
 *   3. POST to the Sparrow /v2/session/validate endpoint with
 *      { pool_id, visitor_id, cache_token, attribution: { zip, tag_zip } }
 *      so the existing live session's attribution is merged with
 *      urlParams.zip + customTags.zip.
 *   4. Reveal the click-to-call CTA. Subsequent /api/call-click-optin payloads
 *      include the ZIP so it round-trips into our own Supabase log.
 */
import { useEffect, useRef, useState } from 'react';
import { Phone, Clock, ShieldCheck, BadgeCheck, DollarSign, MapPin } from 'lucide-react';
import { ComplianceFooter, SocialProof } from './SharedFormComponents';

// Fallback placeholder (matches the seed in index.html). Edge Inject rewrites
// the shell anchor server-side; the client snippet updates it if Edge Inject
// didn't run. Either way the component reads the resolved number from
// window.__sparrow_cb.result or the shell anchor on mount.
const DEFAULT_PHONE_DISPLAY = '1-800-555-0000';
const DEFAULT_PHONE_TEL = '+18005550000';

const ZIP_STORAGE_KEY = 'foc_hvac_call_v3_zip';
const SPARROW_ENDPOINT_FALLBACK = 'https://sparrow-dni.propelsys.workers.dev/dni';

declare global {
  interface Window {
    Sparrow?: {
      setTag?: (key: string, value: string | number | boolean) => void;
      getVisitorId?: () => string | null;
      getCacheToken?: () => string | null;
      isReady?: () => boolean;
    };
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

function readSparrowPoolId(): string | null {
  const script = document.querySelector<HTMLScriptElement>('script[data-sparrow-pool]');
  return script?.getAttribute('data-sparrow-pool') ?? null;
}

function readSparrowEndpoint(): string {
  const script = document.querySelector<HTMLScriptElement>('script[data-sparrow-pool]');
  const src = script?.src ?? '';
  if (!src) return SPARROW_ENDPOINT_FALLBACK;
  let base = src.slice(0, src.lastIndexOf('/'));
  if (base.includes('/v2')) base = base.replace('/v2', '');
  if (!base.endsWith('/dni')) {
    // Fall back if the script src isn't from our Sparrow worker path
    return SPARROW_ENDPOINT_FALLBACK;
  }
  return base;
}

/**
 * Push the ZIP into the live Sparrow DNI session attribution via /v2/session/validate
 * and wait for the server to confirm it committed before resolving.
 *
 * Why awaited fetch instead of sendBeacon: the caller (CTA reveal gate) needs
 * to know the attribution was persisted before it lets the user dial, so the
 * call-flow's `gather_input` skip flag sees the ZIP. sendBeacon has no
 * response handle.
 *
 * Retries every 250ms (up to ~4s) while waiting for the snippet to expose
 * the visitor_id + cache_token, then fires a single fetch with a 3s timeout.
 * Returns true iff the server returned { valid: true }; false on
 * timeout / network error / unconfirmed response.
 */
async function pushZipToSparrow(zip: string): Promise<boolean> {
  // Wait for the snippet to expose visitor + cache token (up to ~4s)
  const maxAttempts = 16;
  let attempts = 0;
  let poolId: string | null = null;
  let visitorId: string | null = null;
  let cacheToken = '';

  while (attempts < maxAttempts) {
    // Set tag for any future sessions. Cheap, sync.
    try {
      window.Sparrow?.setTag?.('zip', zip);
    } catch {
      /* ignore */
    }
    poolId = readSparrowPoolId();
    visitorId = window.Sparrow?.getVisitorId?.() ?? null;
    const edgeResult = window.__sparrow_cb?.result as { cache_token?: string } | undefined;
    cacheToken = window.Sparrow?.getCacheToken?.() ?? edgeResult?.cache_token ?? '';
    if (poolId && visitorId) break;
    attempts += 1;
    await new Promise<void>((r) => window.setTimeout(r, 250));
  }

  if (!poolId || !visitorId) {
    console.warn('[Sparrow] no visitor/pool, skipping validate push');
    return false;
  }

  const endpoint = readSparrowEndpoint();
  const url = `${endpoint}/v2/session/validate`;
  const body = JSON.stringify({
    pool_id: poolId,
    visitor_id: visitorId,
    cache_token: cacheToken,
    // `zip` lands in attribution.urlParams.zip; `tag_zip` lands in
    // attribution.customTags.zip. Belt-and-suspenders for downstream
    // consumers keying off either.
    attribution: { zip, tag_zip: zip },
  });

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      keepalive: true,
    });
    const json = (await res.json().catch(() => ({}))) as { valid?: boolean };
    if (!json?.valid) {
      console.warn('[Sparrow] validate did not confirm', json);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Sparrow] validate failed/timeout', err);
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

function isValidZip(value: string): boolean {
  return /^\d{5}$/.test(value);
}

export default function HVACCallLanderZip() {
  const [phone, setPhone] = useState<{ display: string; tel: string }>(() => ({
    display: DEFAULT_PHONE_DISPLAY,
    tel: `tel:${DEFAULT_PHONE_TEL}`,
  }));

  // ZIP-gate state
  const [zip, setZip] = useState<string>('');
  const [zipInput, setZipInput] = useState<string>('');
  const [zipError, setZipError] = useState<string | null>(null);
  const [step, setStep] = useState<'zip' | 'ready'>('zip');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const zipFieldRef = useRef<HTMLInputElement | null>(null);

  // Hydrate ZIP from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(ZIP_STORAGE_KEY);
      if (stored && isValidZip(stored)) {
        setZip(stored);
        setZipInput(stored);
        setStep('ready');
        // Mirror onto __sparrow_cb.tags synchronously so applyTags + the
        // click-optin payload pick it up without waiting for the network push.
        try {
          window.__sparrow_cb = window.__sparrow_cb || {};
          window.__sparrow_cb.tags = {
            ...(window.__sparrow_cb.tags || {}),
            zip: stored,
          };
        } catch {
          /* ignore */
        }
        // Re-push to the live session — fire-and-forget on mount is fine since
        // the user has already validated this ZIP in a prior visit and the CTA
        // is revealed immediately.
        pushZipToSparrow(stored).catch(() => {
          /* ignore */
        });
      }
    } catch {
      /* ignore storage errors (private mode etc.) */
    }
  }, []);

  // Autofocus the ZIP field on first paint when we're still on step 'zip'
  useEffect(() => {
    if (step === 'zip') {
      // Defer focus to next tick so iOS keyboard pops reliably
      const id = window.setTimeout(() => {
        zipFieldRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [step]);

  // Sync displayed number with whatever Sparrow (Edge Inject or snippet) resolved.
  // We run this regardless of step so the number is ready the moment we flip to step 2.
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

  // Attach Jornaya / TrustedForm tags to DNI + fire call-click optin (incl. zip)
  useEffect(() => {
    const getTokens = () => {
      const leadIdEl = document.getElementById('leadid_token') as HTMLInputElement | null;
      const tfEl = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement | null;
      return {
        jornaya_leadid: leadIdEl?.value || '',
        trustedform_cert_url: tfEl?.value || '',
        landing_page: window.location.href,
        service: 'hvac',
        page: 'hvac-call-v3',
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

      // Include the user-submitted ZIP in query_params so it lands in the
      // call_click_optins.raw_body JSONB without needing a schema change.
      let currentZip: string | null = null;
      try {
        currentZip = window.sessionStorage.getItem(ZIP_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (currentZip && isValidZip(currentZip)) {
        queryParams['zip'] = currentZip;
      }

      const phoneEl = document.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
      const phoneTel = phoneEl?.getAttribute('href') || '';
      const phoneDisplay = phoneEl?.textContent?.trim() || '';
      const sparrowSessionId = window.__sparrow_cb?.result?.session_id || null;

      const payload = {
        txid: queryParams['txid'] || null,
        service: 'hvac',
        page: 'hvac-call-v3',
        zip: currentZip || null,
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

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const cleaned = zipInput.replace(/\D/g, '').slice(0, 5);
    if (!isValidZip(cleaned)) {
      setZipError('Please enter a valid 5-digit US ZIP code.');
      return;
    }
    setZipError(null);
    setSubmitting(true);
    try {
      try {
        window.sessionStorage.setItem(ZIP_STORAGE_KEY, cleaned);
      } catch {
        /* ignore */
      }
      // Mirror onto __sparrow_cb.tags synchronously so any other code paths
      // (the applyTags loop, the click-optin payload builder, etc.) pick it up
      // immediately without waiting for the validate round trip.
      try {
        window.__sparrow_cb = window.__sparrow_cb || {};
        window.__sparrow_cb.tags = {
          ...(window.__sparrow_cb.tags || {}),
          zip: cleaned,
        };
      } catch {
        /* ignore */
      }
      // Best effort — even on failure we still reveal the CTA so the page is
      // usable. The 3s timeout inside pushZipToSparrow caps the worst case.
      await pushZipToSparrow(cleaned);
      setZip(cleaned);
      setStep('ready');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeZip = () => {
    setStep('zip');
    setZipError(null);
    setZipInput(zip);
    try {
      window.sessionStorage.removeItem(ZIP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

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

          {/* ZIP gate — step 1 */}
          {step === 'zip' && (
            <form
              onSubmit={handleZipSubmit}
              className="mt-5 sm:mt-6 rounded-2xl border border-brand-blue/15 bg-white p-5 sm:p-6 shadow-custom-sm"
              noValidate
            >
              <label
                htmlFor="hvac-call-zip"
                className="flex items-center gap-2 text-sm font-bold text-brand-navy"
              >
                <MapPin className="h-4 w-4 text-brand-blue" />
                Enter your ZIP to see your free quote number
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                We use your ZIP to match you with local, licensed HVAC pros in your area.
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  ref={zipFieldRef}
                  id="hvac-call-zip"
                  name="zip"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{5}"
                  autoComplete="postal-code"
                  maxLength={5}
                  placeholder="ZIP code"
                  value={zipInput}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZipInput(next);
                    if (zipError) setZipError(null);
                  }}
                  aria-invalid={zipError ? 'true' : 'false'}
                  aria-describedby={zipError ? 'hvac-call-zip-error' : undefined}
                  className="flex-1 rounded-xl border border-brand-blue/30 bg-white px-4 py-3 text-base font-semibold tabular-nums tracking-wider text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting ? 'true' : 'false'}
                  className="rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors px-5 py-3 text-base font-extrabold uppercase text-white shadow-button ring-1 ring-red-700/20 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-70 disabled:cursor-wait"
                >
                  {submitting ? 'Loading…' : 'See My Free Quote Number'}
                </button>
              </div>

              {zipError && (
                <p
                  id="hvac-call-zip-error"
                  role="alert"
                  className="mt-2 text-xs font-semibold text-red-600"
                >
                  {zipError}
                </p>
              )}
            </form>
          )}

          {/* CTA — step 2.
              The visible number comes from React state (`phone`), which is synced
              from window.__sparrow_cb.result (Edge Inject) or the #sparrow-dni-shell
              anchor in index.html (client-side snippet swap). No data-sparrow-* attrs
              on the visible CTA, so Sparrow never fights React for this DOM. */}
          {step === 'ready' && (
            <>
              <div className="mt-5 sm:mt-6 flex items-center justify-between rounded-xl border border-brand-blue/15 bg-white px-4 py-2.5 shadow-custom-sm">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  Showing matches for <span className="font-bold text-brand-navy tabular-nums">{zip}</span>
                </span>
                <button
                  type="button"
                  onClick={handleChangeZip}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Change
                </button>
              </div>

              <a
                href={phone.tel}
                aria-label={`Tap to call ${phone.display}`}
                className="group mt-3 block rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-button ring-1 ring-red-700/20 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                <div className="flex flex-col items-center justify-center gap-0.5 px-5 py-3.5 sm:py-4 text-white">
                  <span className="flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold tracking-tight uppercase">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                    Call Now for FREE
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-white/90 tabular-nums">
                    {phone.display}
                  </span>
                </div>
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Tap the above number to call for free
              </p>
            </>
          )}

          {/* Trust strip — three reassurance pills */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { Icon: DollarSign, label: 'Free quotes' },
              { Icon: ShieldCheck, label: 'Licensed pros' },
              { Icon: BadgeCheck, label: 'No obligation' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-brand-blue/15 bg-white px-2 py-3 text-center shadow-custom-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-brand-navy leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <section className="mt-5 rounded-2xl border border-brand-blue/15 bg-white p-5 sm:p-6 shadow-custom-sm">
            <h2 className="text-base sm:text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-blue" />
              How it works
            </h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-sm">
                  1
                </span>
                <div className="leading-snug">
                  <p className="text-base font-semibold text-foreground">Enter your ZIP</p>
                  <p className="text-sm text-muted-foreground">So we can match you with a pro in your area.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-sm">
                  2
                </span>
                <div className="leading-snug">
                  <p className="text-base font-semibold text-foreground">Tap the number we show you</p>
                  <p className="text-sm text-muted-foreground">
                    Free, fast — connects you with a licensed local HVAC pro in seconds.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-sm">
                  3
                </span>
                <div className="leading-snug">
                  <p className="text-base font-semibold text-foreground">Get competing quotes</p>
                  <p className="text-sm text-muted-foreground">
                    Compare prices from multiple contractors and choose the best fit — no obligation.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* TCPA / consent — de-emphasized */}
          <section className="mt-5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
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
