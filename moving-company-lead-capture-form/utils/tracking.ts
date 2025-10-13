import type { Tracking } from '../types';

function generateSessionId(): string {
  // Use cryptographically secure randomness for the random part of the session ID
  const arr = new Uint32Array(2);
  window.crypto.getRandomValues(arr);
  // Convert the array of random integers to a base36 string
  const randomPart = Array.from(arr).map(n => n.toString(36)).join('');
  return `${Date.now()}-${randomPart}`;
}

export function getTrackingData(): Tracking {
  const urlParams = new URLSearchParams(window.location.search);

  let firstPageSeenAt = sessionStorage.getItem('first_page_seen_at');
  if (!firstPageSeenAt) {
    firstPageSeenAt = new Date().toISOString();
    sessionStorage.setItem('first_page_seen_at', firstPageSeenAt);
  }

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }

  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
    gclid: urlParams.get('gclid'),
    fbclid: urlParams.get('fbclid'),
    referrer_url: document.referrer || null,
    landing_url: window.location.href,
    user_agent: navigator.userAgent,
    ip: null, // To be resolved server-side
    first_page_seen_at: firstPageSeenAt,
    session_id: sessionId,
  };
}