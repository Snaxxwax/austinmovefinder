import { useState, useReducer, useCallback, useEffect } from 'react';
import type { LeadData, FormErrors, Step, Prospect, Move, Consent, HomeSize, StairsOrElevator, BudgetRange } from '../types';
import { submitLead } from '../services/leadService';

// Fix for: Property 'dataLayer' does not exist on type 'Window & typeof globalThis'.
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const TCPA_CONSENT_TEXT = "I agree to be contacted by phone, SMS, and email by partner moving companies regarding my inquiry. Message/data rates may apply. Consent not required to purchase.";
const FORM_NAME = 'Moving Lead Form';

export const STEPS: Step[] = [
  { id: 1, name: 'Contact Info', fields: ['first_name', 'last_name', 'email', 'phone'] },
  { id: 2, name: 'Move Details', fields: ['from_zip', 'to_zip', 'date', 'flexible'] },
  { id: 3, name: 'Home Size', fields: ['home_size', 'items_count'] },
  { id: 4, name: 'Logistics', fields: ['stairs_or_elevator', 'parking_constraints', 'budget_range', 'notes', 'tcpa'] },
];

const initialData: LeadData = {
  prospect: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  },
  move: {
    from_zip: '',
    to_zip: '',
    date: '',
    flexible: false,
    home_size: null,
    items_count: null,
    stairs_or_elevator: null,
    parking_constraints: '',
    budget_range: null,
    notes: '',
  },
  tracking: {
    utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null,
    gclid: null, fbclid: null, referrer_url: null, landing_url: null, user_agent: null,
    ip: null, first_page_seen_at: null, session_id: null,
  },
  consent: {
    tcpa: false,
    text: TCPA_CONSENT_TEXT,
  },
  honeypot_nickname: '',
};

type FormState = {
  data: LeadData;
  errors: FormErrors;
}

type Action = 
  | { type: 'UPDATE_FIELD'; payload: { section: keyof LeadData; field: string; value: any } }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | { type: 'RESET_FORM' };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      const { section, field, value } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [section]: {
            // @ts-ignore
            ...state.data[section],
            [field]: value,
          },
        },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET_FORM':
      return { data: initialData, errors: {} };
    default:
      return state;
  }
}

/**
 * Validates the entire lead data object based on the JSON schema rules.
 * @param data The complete lead data.
 * @returns An object containing any validation errors.
 */
const validate = (data: LeadData): FormErrors => {
    const errors: FormErrors = {};

    // Prospect validation (Step 1)
    if (!data.prospect.first_name) errors.first_name = 'This field is required.';
    if (!data.prospect.last_name) errors.last_name = 'This field is required.';
    
    const hasEmail = !!data.prospect.email;
    const hasPhone = !!data.prospect.phone;

    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.prospect.email!)) {
        errors.email = 'Please enter a valid email address.';
    }
    if (hasPhone) {
        const digits = data.prospect.phone!.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 10) {
            errors.phone = 'Please enter a complete 10-digit phone number.';
        }
    }
    if (!hasEmail && !hasPhone) {
        errors.email = 'Either email or phone is required.';
        errors.phone = 'Either email or phone is required.';
    }

    // Move validation (Step 2)
    if (!data.move.from_zip || !/^\d{5}$/.test(data.move.from_zip)) {
        errors.from_zip = 'Must be a 5-digit ZIP code.';
    }
    if (!data.move.to_zip || !/^\d{5}$/.test(data.move.to_zip)) {
        errors.to_zip = 'Must be a 5-digit ZIP code.';
    }
    
    // Date validation logic
    if (data.move.date) {
        const parts = data.move.date.split('-').map(s => parseInt(s, 10));
        // new Date(year, monthIndex, day) creates a date at midnight in the local timezone
        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]); 
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight this morning, local time

        if (selectedDate <= today) {
             errors.date = 'Move date must be in the future.';
        }
    } else if (!data.move.flexible) {
        // If no date is provided and dates are NOT flexible, it's an error.
        errors.date = 'Please select a move date or check "My dates are flexible".';
    }


    // Home Size validation (Step 3)
    const hasHomeSize = data.move.home_size;
    const hasValidItemsCount = data.move.items_count && data.move.items_count >= 1;

    if (!hasHomeSize && !hasValidItemsCount) {
        errors.home_size = 'Please select your home size or enter a valid item count.';
    }
    if (data.move.items_count !== null && data.move.items_count < 1) {
        errors.items_count = 'Number of items must be 1 or more.';
    }
    
    // Logistics validation (Step 4)
    if (!data.consent.tcpa) {
        errors.tcpa = 'You must agree to the terms to proceed.';
    }
    
    return errors;
};


export const useLeadForm = () => {
  const [{ data, errors }, dispatch] = useReducer(formReducer, { data: initialData, errors: {} });
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [formStartTime] = useState(Date.now());

  useEffect(() => {
    if (window.dataLayer) {
        window.dataLayer.push({
            event: 'form_start',
            form_name: FORM_NAME,
        });
    }
  }, []); // Run only on initial mount


  const updateField = useCallback((section: keyof LeadData, field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { section, field, value } });
    if (errors[field as keyof FormErrors]) {
      const newErrors = { ...errors };
      delete newErrors[field as keyof FormErrors];
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
    }
  }, [errors]);

  const validateCurrentStep = (): boolean => {
    const allErrors = validate(data);
    const stepErrors: FormErrors = {};
    const currentFields = STEPS[currentStep].fields;

    currentFields.forEach(field => {
        if (allErrors[field as keyof FormErrors]) {
            stepErrors[field as keyof FormErrors] = allErrors[field as keyof FormErrors];
        }
    });

    dispatch({ type: 'SET_ERRORS', payload: stepErrors });
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'form_step_change',
                form_name: FORM_NAME,
                step_direction: 'next',
                from_step: STEPS[currentStep].name,
                to_step: STEPS[currentStep + 1].name,
            });
        }
        setCurrentStep(currentStep + 1);
        dispatch({ type: 'SET_ERRORS', payload: {} }); // Clear errors for next step
      }
    } else {
        const allErrors = validate(data);
        const stepErrorFields = STEPS[currentStep].fields.filter(field => allErrors[field as keyof FormErrors]);
        if (window.dataLayer && stepErrorFields.length > 0) {
            window.dataLayer.push({
                event: 'form_validation_error',
                form_name: FORM_NAME,
                error_fields: stepErrorFields,
                error_trigger: 'step_change',
                error_step: STEPS[currentStep].name,
            });
        }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'form_step_change',
                form_name: FORM_NAME,
                step_direction: 'back',
                from_step: STEPS[currentStep].name,
                to_step: STEPS[currentStep - 1].name,
            });
        }
      setCurrentStep(currentStep - 1);
      dispatch({ type: 'SET_ERRORS', payload: {} }); // Clear errors on going back
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam checks
    if (data.honeypot_nickname) {
        console.warn("Honeypot field filled, likely a bot. Submission blocked.");
        return; // Silently fail
    }
    const timeOnPage = Date.now() - formStartTime;
    if (timeOnPage < 5000) { // 5 seconds
        console.warn(`Form submitted too quickly (${timeOnPage}ms). Submission blocked.`);
        return; // Silently fail
    }

    const allErrors = validate(data);
    dispatch({ type: 'SET_ERRORS', payload: allErrors });

    if (Object.keys(allErrors).length > 0) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'form_validation_error',
                form_name: FORM_NAME,
                error_fields: Object.keys(allErrors),
                error_trigger: 'final_submission',
            });
        }
        // Find the first step with an error and go to it
        for (let i = 0; i < STEPS.length; i++) {
            const stepFields = STEPS[i].fields;
            const hasError = stepFields.some(field => allErrors.hasOwnProperty(field));
            if(hasError) {
                setCurrentStep(i);
                break;
            }
        }
        return;
    }
    
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const result = await submitLead(data);
      if (result.ok && result.lead_id) {
        setSubmittedLeadId(result.lead_id);
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'form_submission_success',
            form_name: FORM_NAME,
            lead_id: result.lead_id,
          });
        }
      } else {
        throw new Error('Submission failed, but the lead has been queued for a retry.');
      }
    } catch (error: any) {
      console.error("Form submission failed:", error);
      let errorMessage: string;
      let errorType: string;

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Please check your internet connection. Your information has been saved and will be submitted automatically when you are back online.';
          errorType = 'network_error';
      } else {
          errorMessage = 'An error occurred while submitting your request. Your information has been saved and we will retry sending it shortly.';
          errorType = 'server_error';
      }
      
      setSubmissionError(errorMessage);

       if (window.dataLayer) {
            window.dataLayer.push({
                event: 'form_submission_error',
                form_name: FORM_NAME,
                error_type: errorType,
                error_message: error.message || 'Unknown submission error',
            });
        }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    setCurrentStep(0);
    setIsSubmitting(false);
    setSubmissionError(null);
    setSubmittedLeadId(null);
  };

  return {
    data,
    errors,
    currentStep,
    isSubmitting,
    submissionError,
    submittedLeadId,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    steps: STEPS,
  };
};