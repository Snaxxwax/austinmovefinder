import type { LeadData } from '../types';
import { getTrackingData } from '../utils/tracking';

// --- Configuration Constants ---
// Implementation Notes:
// 1. Paste your Google Opal webhook URL here. This is the endpoint that receives the lead data.
const OPAL_WEBHOOK_URL = 'https://opal.google.com/your/webhook/endpoint'; 

// 2. Add a secret token to authenticate requests between your form and the webhook.
//    Ensure this token is also configured in your Opal flow for verification.
const OPAL_WEBHOOK_TOKEN = 'your-secret-webhook-token'; 

const TCPA_CONSENT_TEXT = "I agree to be contacted by phone, SMS, and email by partner moving companies regarding my inquiry. Message/data rates may apply. Consent not required to purchase.";

const STORAGE_KEY = 'pending_leads';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// This function constructs the final payload by removing the honeypot field
// and adding tracking data and a server timestamp placeholder.
const preparePayload = (formData: LeadData) => {
  const { honeypot_nickname, ...restOfData } = formData;

  const prospectPayload = { ...restOfData.prospect };
  
  // Sanitize phone number from masked format to E.164
  if (prospectPayload.phone) {
    const digits = prospectPayload.phone.replace(/\D/g, '');
    if (digits.length === 10) { // Assuming US number based on mask
      prospectPayload.phone = `+1${digits}`;
    }
  }
  
  const finalPayload = {
    ...restOfData,
    prospect: prospectPayload,
    timestamp: new Date().toISOString(),
    tracking: getTrackingData(),
    consent: {
      ...restOfData.consent,
      text: TCPA_CONSENT_TEXT,
    }
  };

  return finalPayload;
}


const postLead = async (payload: Omit<LeadData, 'honeypot_nickname'>): Promise<{ok: boolean, lead_id?: string}> => {
  const response = await fetch(OPAL_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Token': OPAL_WEBHOOK_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const submitLead = async (formData: LeadData): Promise<{ok: boolean, lead_id?: string}> => {
  const payload = preparePayload(formData);
  try {
    const result = await postLead(payload);
    // On success, try to submit any queued leads
    submitQueuedLeads();
    return result;
  } catch (error) {
    console.error('Failed to submit lead, queueing for later.', error);
    queueLead(payload);
    throw error; // Re-throw to let the UI know it failed
  }
};

const queueLead = (payload: Omit<LeadData, 'honeypot_nickname'>) => {
  try {
    const queuedLeads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    queuedLeads.push(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queuedLeads));
  } catch (e) {
    console.error("Could not queue lead in localStorage", e);
  }
};

const submitQueuedLeads = async () => {
  let queuedLeads: Omit<LeadData, 'honeypot_nickname'>[] = [];
  try {
    queuedLeads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
     console.error("Could not parse queued leads from localStorage", e);
     return;
  }
  
  if (queuedLeads.length === 0) {
    return;
  }

  console.log(`Attempting to submit ${queuedLeads.length} queued leads.`);

  const remainingLeads = [];

  for (const lead of queuedLeads) {
    try {
      await postLeadWithRetry(lead, 0);
    } catch (error) {
      console.error('Failed to submit queued lead after retries, keeping in queue.', error);
      remainingLeads.push(lead);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingLeads));
};

const postLeadWithRetry = async (payload: Omit<LeadData, 'honeypot_nickname'>, attempt: number) => {
  try {
    await postLead(payload);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Retrying submission in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      await postLeadWithRetry(payload, attempt + 1);
    } else {
      throw new Error('Max retries reached for queued lead.');
    }
  }
};

// Attempt to submit queued leads on application load
if(typeof window !== 'undefined'){
    window.addEventListener('online', submitQueuedLeads);
    submitQueuedLeads();
}