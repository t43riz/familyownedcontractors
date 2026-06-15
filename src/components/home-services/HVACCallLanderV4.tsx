/**
 * HVAC Call-Only Lander — v4
 * Facebook Messenger-style chat experience. The "HVAC Specialist" greets the
 * visitor, collects a ZIP code in-chat, plays typing animations, then surfaces
 * a click-to-call button (the matched contractor's number) with a live
 * "waiting on your call" countdown.
 *
 * Reuses the Sparrow DNI / Jornaya / TrustedForm / call-click-optin wiring from
 * HVACCallLander.tsx (v2) so call attribution and TCPA opt-in logging behave
 * identically — only `page` is bumped to 'hvac-call-v4'.
 *
 * Like v3 (HVACCallLanderZip), the ZIP collected in-chat is pushed to the live
 * Sparrow DNI session so call attribution carries it:
 *   1. Persist ZIP in sessionStorage (foc_hvac_call_v4_zip).
 *   2. Call window.Sparrow.setTag('zip', zip) so any new sessions pick it up.
 *   3. POST to the Sparrow /v2/session/validate endpoint with
 *      { pool_id, visitor_id, cache_token, attribution: { zip, tag_zip } }
 *      so the existing live session's attribution is merged.
 *   4. Subsequent /api/call-click-optin payloads include the ZIP so it
 *      round-trips into our own Supabase log.
 */
import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import agentAvatar from '@/assets/agent-avatar.jpg';

// Fallback placeholder (matches the seed in index.html). Edge Inject rewrites
// the shell anchor server-side; the client snippet updates it if Edge Inject
// didn't run. Either way the component reads the resolved number from
// window.__sparrow_cb.result or the shell anchor on mount.
const DEFAULT_PHONE_DISPLAY = '1-800-555-0000';
const DEFAULT_PHONE_TEL = '+18005550000';

const ZIP_STORAGE_KEY = 'foc_hvac_call_v4_zip';
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

function isValidZip(value: string): boolean {
  return /^\d{5}$/.test(value);
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

type Bubble =
  | { id: number; from: 'bot' | 'user'; kind: 'text'; text: string }
  | { id: number; from: 'bot'; kind: 'typing' }
  | { id: number; from: 'bot'; kind: 'cta' };

export default function HVACCallLanderV4() {
  const [phone, setPhone] = useState<{ display: string; tel: string }>(() => ({
    display: DEFAULT_PHONE_DISPLAY,
    tel: `tel:${DEFAULT_PHONE_TEL}`,
  }));

  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: 1,
      from: 'bot',
      kind: 'text',
      text:
        "Hi there! 👋 I'll check local HVAC contractors near you and help you find the best installation price. What ZIP code is the home in?",
    },
  ]);
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(30);
  // Mobile: bind the app height to the visual viewport so an open keyboard
  // shrinks the app (input rides above it) instead of leaving the body
  // scrolled — which pushed the header off-screen and opened a void below.
  const [appHeight, setAppHeight] = useState<number | null>(null);

  const idRef = useRef(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  const nextId = () => idRef.current++;

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Keep the app sized to the visible viewport on mobile (keyboard-aware) and
  // pin the body to the top so it can never be left in a scrolled state.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const mql = window.matchMedia('(max-width: 639px)');
    const update = () => {
      if (mql.matches) {
        setAppHeight(vv.height);
        window.scrollTo(0, 0);
      } else {
        setAppHeight(null);
      }
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    mql.addEventListener('change', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      mql.removeEventListener('change', update);
    };
  }, []);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

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
        page: 'hvac-call-v4',
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
        page: 'hvac-call-v4',
        zip: currentZip && isValidZip(currentZip) ? currentZip : null,
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

  // Countdown ticks once the CTA is revealed
  useEffect(() => {
    if (!submitted) return;
    const hasCta = messages.some((m) => m.kind === 'cta');
    if (!hasCta) return;
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [submitted, countdown, messages]);

  const schedule = (fn: () => void, delay: number) => {
    const t = window.setTimeout(fn, delay);
    timersRef.current.push(t);
  };

  // Persist the ZIP locally + mirror onto __sparrow_cb.tags synchronously, then
  // push it into the live Sparrow DNI session so call attribution carries it.
  // Mirrors HVACCallLanderZip (v3). Fire-and-forget on the push: even if the
  // validate round trip fails the chat still reveals the CTA so the page is
  // usable (the 3s timeout inside pushZipToSparrow caps the worst case).
  const commitZip = (clean: string) => {
    try {
      window.sessionStorage.setItem(ZIP_STORAGE_KEY, clean);
    } catch {
      /* ignore storage errors (private mode etc.) */
    }
    try {
      window.__sparrow_cb = window.__sparrow_cb || {};
      window.__sparrow_cb.tags = {
        ...(window.__sparrow_cb.tags || {}),
        zip: clean,
      };
    } catch {
      /* ignore */
    }
    pushZipToSparrow(clean).catch(() => {
      /* ignore */
    });
  };

  // Hydrate ZIP from sessionStorage on mount — if the visitor already validated
  // a ZIP this session, fast-forward the chat straight to the revealed CTA.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(ZIP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!stored || !isValidZip(stored)) return;

    setSubmitted(true);
    // Mirror onto __sparrow_cb.tags synchronously + re-push to the live session.
    commitZip(stored);
    // Render the resolved conversation state immediately (no typing animation).
    setMessages((m) => [
      ...m,
      { id: nextId(), from: 'user', kind: 'text', text: stored as string },
      {
        id: nextId(),
        from: 'bot',
        kind: 'text',
        text:
          'I found an HVAC contractor in your area who is currently available, has verified reviews, and could lower the quote for your new HVAC system. Tap the button to make a free call. 👇',
      },
      { id: nextId(), from: 'bot', kind: 'cta' },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = zip.replace(/\D/g, '').slice(0, 5);
    if (clean.length !== 5 || submitted) {
      inputRef.current?.focus();
      return;
    }
    setSubmitted(true);
    setZip('');

    // Persist + push the ZIP into the live Sparrow session. Runs in parallel
    // with the typing animation so attribution is committed well before the
    // ~5s CTA reveal.
    commitZip(clean);

    // User's ZIP bubble
    setMessages((m) => [...m, { id: nextId(), from: 'user', kind: 'text', text: clean }]);

    // 1) typing → "Thank you. One second, please."
    const typingId1 = nextId();
    schedule(() => {
      setMessages((m) => [...m, { id: typingId1, from: 'bot', kind: 'typing' }]);
    }, 500);
    schedule(() => {
      setMessages((m) =>
        m.map((b) =>
          b.id === typingId1
            ? { id: b.id, from: 'bot', kind: 'text', text: 'Thank you. One second, please.' }
            : b
        )
      );
    }, 2000);

    // 2) typing → "I found an HVAC contractor..." + CTA button
    const typingId2 = nextId();
    schedule(() => {
      setMessages((m) => [...m, { id: typingId2, from: 'bot', kind: 'typing' }]);
    }, 2700);
    schedule(() => {
      setMessages((m) =>
        m.map((b) =>
          b.id === typingId2
            ? {
                id: b.id,
                from: 'bot',
                kind: 'text',
                text:
                  'I found an HVAC contractor in your area who is currently available, has verified reviews, and could lower the quote for your new HVAC system. Tap the button to make a free call. 👇',
              }
            : b
        )
      );
    }, 4800);
    schedule(() => {
      setMessages((m) => [...m, { id: nextId(), from: 'bot', kind: 'cta' }]);
    }, 5100);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-slate-100 sm:justify-center">
      {/* Hidden compliance inputs — populated by Jornaya / TrustedForm scripts in index.html */}
      <input id="leadid_token" name="universal_leadid" type="hidden" />
      <input id="xxTrustedFormCertUrl" name="xxTrustedFormCertUrl" type="hidden" />

      {/* Messenger-style chat shell */}
      <div className="mx-auto flex w-full max-w-md flex-col bg-white shadow-xl sm:my-4 sm:rounded-2xl sm:overflow-hidden">
        {/* Chat app — sized to the visible viewport (keyboard-aware) so the
            conversation + input always fit; the disclaimer lives below it in
            scroll flow and never steals space from the chat. */}
        <div
          className="flex h-[100dvh] flex-col overflow-hidden sm:h-[32rem] sm:max-h-[calc(100dvh-12rem)]"
          style={appHeight ? { height: `${appHeight}px` } : undefined}
        >
        {/* Header — clean Messenger chat bar: who you're talking to + brand mark */}
        <header className="flex items-center justify-between gap-3 overflow-hidden bg-gradient-to-r from-[#00B2FF] to-[#006AFF] px-4 py-3 text-white shadow-md">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={agentAvatar}
                alt="HVAC Specialist"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/60"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0099f7] bg-green-400" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[15px] font-semibold">HVAC Specialist</p>
              <p className="flex items-center gap-1.5 text-xs text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Online now
              </p>
            </div>
          </div>

          <a href="/" aria-label="Family Owned Contractors" className="ml-2 max-w-[42%] shrink-0 opacity-95 transition-opacity hover:opacity-100">
            <img src="/FOC_name_logo_white.svg" alt="Family Owned Contractors" className="h-5 w-auto max-w-full object-contain sm:h-6" />
          </a>
        </header>

        {/* Value-prop banner — its own calm band so the header stays uncluttered */}
        <div className="border-b border-gray-200 bg-white px-4 py-2.5 text-center">
          <p className="text-sm font-bold leading-tight text-brand-navy sm:text-[15px]">
            Save Money On Your HVAC Install
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
            Free Quotes · Licensed Pros · No Obligation
          </p>
        </div>

        {/* Message thread */}
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f6f8] px-3 py-4"
        >
          {/* mt-auto keeps the latest message pinned to the bottom (just above the
              input) when the thread isn't full, so the keyboard never reveals a void. */}
          <div className="mt-auto space-y-3">
          {messages.map((m) => {
            if (m.from === 'user') {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[#0084ff] px-3.5 py-2 text-[15px] text-white shadow-sm">
                    {m.kind === 'text' ? m.text : null}
                  </div>
                </div>
              );
            }

            // Bot messages — avatar + bubble on the left
            return (
              <div key={m.id} className="flex items-end gap-2">
                <img
                  src={agentAvatar}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
                {m.kind === 'typing' ? (
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#e9e9eb] px-4 py-3 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                ) : m.kind === 'cta' ? (
                  <div className="max-w-[85%] space-y-2">
                    {/* NUMBER BUTTON — the visible number comes from React state
                        (`phone`), synced from window.__sparrow_cb.result (Edge
                        Inject) or the #sparrow-dni-shell anchor in index.html
                        (client snippet swap). No data-sparrow-* attrs here so
                        Sparrow never fights React for this DOM; click capture
                        still works via the snippet's closest('a[href^="tel:"]'). */}
                    <a
                      href={phone.tel}
                      aria-label={`Tap to call ${phone.display}`}
                      className="flex flex-col items-center gap-0.5 rounded-2xl bg-green-500 px-5 py-3 text-white shadow-md transition-colors hover:bg-green-600 active:bg-green-700"
                    >
                      <span className="flex items-center gap-2 text-base font-extrabold uppercase tracking-tight">
                        <Phone className="h-5 w-5" />
                        Tap to Call — FREE
                      </span>
                      <span className="text-lg font-bold tabular-nums">
                        {phone.display}
                      </span>
                    </a>
                    <div className="rounded-2xl rounded-bl-md bg-[#e9e9eb] px-3.5 py-2.5 text-center shadow-sm">
                      <p className="text-[13px] font-medium text-gray-700">
                        The contractor is waiting on your call for the next:
                      </p>
                      <p className="mt-1 text-3xl font-extrabold tabular-nums text-red-600">
                        0:{String(countdown).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#e9e9eb] px-3.5 py-2 text-[15px] leading-snug text-gray-900 shadow-sm">
                    {m.text}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            disabled={submitted}
            placeholder={submitted ? 'Tap the call button above 👆' : 'Enter your ZIP code…'}
            className="min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-4 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#0084ff]/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitted || zip.length !== 5}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0084ff] text-white transition-colors hover:bg-[#0070da] disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
        </div>
        {/* end chat app */}

        {/* TCPA / consent — full text, always readable; sits below the chat in
            scroll flow so it never crowds the conversation or the keyboard. */}
        <div className="border-t border-gray-100 bg-white px-3 py-2">
          <p className="text-[10px] leading-snug text-gray-500">
            By tapping the call button, I agree and provide my electronic signature as express written
            consent for FamilyOwnedContractors.com and up to 4 of its{' '}
            <a href="/partners" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">marketing partners</a>,
            including American Residential Services LLC, affiliated home service companies and their
            partners, and parties acting on their behalf, to contact me for marketing and telemarketing
            purposes regarding home improvement services via phone calls and text messages at the number
            I dial or that is dialed for me, including calls or texts placed using an automatic telephone
            dialing system or an artificial or prerecorded voice. I understand that my consent is{' '}
            <span className="font-semibold">not a condition</span> of purchasing any goods or services.
            Message and data rates may apply. Message frequency may vary. Text HELP for assistance or STOP
            to opt out. My consent applies even if my number is on any state or federal Do-Not-Call
            registry. Calls may be recorded for quality and compliance. I have read and agree to the{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Privacy Policy</a> and{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
