import React from 'react';
import { useLeadForm, STEPS } from './hooks/useLeadForm';
// Fix for: 'HomeSize', 'StairsOrElevator', and 'BudgetRange' cannot be used as a value because it was imported using 'import type'.
import { type LeadData, type FormErrors, HomeSize, StairsOrElevator, BudgetRange } from './types';

// --- Configuration Constants ---
// Implementation Notes:
// 3. Optional: Add a reCAPTCHA v3 site key to enable it.
//    You'll need to uncomment the reCAPTCHA logic in the handleSubmit function.
const RECAPTCHA_SITE_KEY = 'your-google-recaptcha-v3-site-key';

// 4. Optional: Provide a URL to redirect to upon successful submission.
//    If left null, a "Thank You" message will be shown instead.
const SUCCESS_REDIRECT_URL: string | null = null;

// 5. Optional: Add buyer emails and webhook URLs here.
//    The Opal flow will use these to distribute leads.
const BUYER_EMAILS: string[] = ['buyer1@example.com', 'buyer2@example.com'];
const BUYER_WEBHOOKS: { url: string; secret: string }[] = [
  { url: 'https://buyer1.com/webhook', secret: 'buyer1-shared-secret' },
  { url: 'https://buyer2.com/webhook', secret: 'buyer2-shared-secret' },
];
// --- End Configuration ---


const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}
const TextInput: React.FC<InputProps> = ({ label, id, error, wrapperClassName, ...props }) => (
  <div className={`mb-4 ${wrapperClassName}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
    <input
      id={id}
      className={`block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}
const SelectInput: React.FC<SelectProps> = ({ label, id, error, wrapperClassName, children, ...props }) => (
    <div className={`mb-4 ${wrapperClassName}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <select
            id={id}
            className={`block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    wrapperClassName?: string;
}

const TextAreaInput: React.FC<TextAreaProps> = ({ label, id, error, wrapperClassName, ...props }) => (
    <div className={`mb-4 ${wrapperClassName}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <textarea
            id={id}
            rows={3}
            className={`block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);


const Step1: React.FC<{ data: LeadData; updateField: Function; errors: FormErrors }> = ({ data, updateField, errors }) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, '').substring(0, 10);
        const areaCode = input.substring(0, 3);
        const middle = input.substring(3, 6);
        const last = input.substring(6, 10);

        let maskedValue = '';
        if (input.length > 6) {
            maskedValue = `(${areaCode})${middle}-${last}`;
        } else if (input.length > 3) {
            maskedValue = `(${areaCode})${middle}`;
        } else if (input.length > 0) {
            maskedValue = `(${areaCode}`;
        }
        
        updateField('prospect', 'phone', maskedValue);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Information</h2>
            <p className="mb-6 text-gray-600">Let's start with the basics.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="First Name" id="first_name" value={data.prospect.first_name} onChange={(e) => updateField('prospect', 'first_name', e.target.value)} error={errors.first_name} required />
                <TextInput label="Last Name" id="last_name" value={data.prospect.last_name} onChange={(e) => updateField('prospect', 'last_name', e.target.value)} error={errors.last_name} required />
            </div>
            <TextInput label="Email Address" id="email" type="email" value={data.prospect.email || ''} onChange={(e) => updateField('prospect', 'email', e.target.value)} error={errors.email} placeholder="you@example.com" />
            <TextInput label="Phone Number" id="phone" type="tel" value={data.prospect.phone || ''} onChange={handlePhoneChange} error={errors.phone} placeholder="(555)123-4567" />
        </div>
    );
};

const Step2: React.FC<{ data: LeadData; updateField: Function; errors: FormErrors }> = ({ data, updateField, errors }) => {
    const handleZipChange = (fieldName: 'from_zip' | 'to_zip', value: string) => {
        const numericValue = value.replace(/\D/g, '');
        updateField('move', fieldName, numericValue);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Move Details</h2>
            <p className="mb-6 text-gray-600">Where are you moving from and to?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Moving From ZIP Code" id="from_zip" value={data.move.from_zip} onChange={(e) => handleZipChange('from_zip', e.target.value)} error={errors.from_zip} required maxLength={5} inputMode="numeric" />
                <TextInput label="Moving To ZIP Code" id="to_zip" value={data.move.to_zip} onChange={(e) => handleZipChange('to_zip', e.target.value)} error={errors.to_zip} required maxLength={5} inputMode="numeric" />
            </div>
            <TextInput label="Desired Move Date" id="date" type="date" value={data.move.date || ''} onChange={(e) => updateField('move', 'date', e.target.value)} error={errors.date} disabled={data.move.flexible} wrapperClassName="mt-4" />
            <div className="flex items-center">
                <input id="flexible" type="checkbox" checked={data.move.flexible} onChange={(e) => updateField('move', 'flexible', e.target.checked)} className="h-4 w-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                <label htmlFor="flexible" className="ml-2 block text-sm text-gray-900">My dates are flexible</label>
            </div>
        </div>
    );
};
  
const Step3: React.FC<{ data: LeadData; updateField: Function; errors: FormErrors }> = ({ data, updateField, errors }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Home Size</h2>
        <p className="mb-6 text-gray-600">Tell us about the size of your move.</p>
        <SelectInput 
            label="Size of Home" 
            id="home_size" 
            value={data.move.home_size || ''} 
            onChange={(e) => updateField('move', 'home_size', e.target.value)} 
            error={errors.home_size}
        >
            <option value="">Select size...</option>
            {Object.values(HomeSize).map(size => <option key={size} value={size}>{size}</option>)}
        </SelectInput>
        <p className="text-center my-4 text-gray-500">OR</p>
        <TextInput 
            label="Approximate Number of Items" 
            id="items_count" 
            type="number"
            value={data.move.items_count || ''}
            onChange={(e) => updateField('move', 'items_count', parseInt(e.target.value, 10) || null)} 
            error={errors.items_count}
            placeholder="e.g., 50"
        />
    </div>
);


const Step4: React.FC<{ data: LeadData; updateField: Function; errors: FormErrors }> = ({ data, updateField, errors }) => (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Logistics & Final Details</h2>
      <p className="mb-6 text-gray-600">A few more details to get you an accurate quote.</p>
      <SelectInput label="Stairs or Elevator" id="stairs_or_elevator" value={data.move.stairs_or_elevator || ''} onChange={(e) => updateField('move', 'stairs_or_elevator', e.target.value)}>
        <option value="">Select one...</option>
        {Object.values(StairsOrElevator).map(val => <option key={val} value={val} className="capitalize">{val}</option>)}
      </SelectInput>
      <SelectInput label="Budget Range" id="budget_range" value={data.move.budget_range || ''} onChange={(e) => updateField('move', 'budget_range', e.target.value)}>
        <option value="">Select range...</option>
        {Object.values(BudgetRange).map(val => <option key={val} value={val}>{val}</option>)}
      </SelectInput>
      <TextAreaInput label="Parking Constraints (Optional)" id="parking_constraints" value={data.move.parking_constraints || ''} onChange={(e) => updateField('move', 'parking_constraints', e.target.value)} />
      <TextAreaInput label="Additional Notes (Optional)" id="notes" value={data.move.notes || ''} onChange={(e) => updateField('move', 'notes', e.target.value)} />
      
      <div className="mt-6">
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input id="tcpa" type="checkbox" checked={data.consent.tcpa} onChange={(e) => updateField('consent', 'tcpa', e.target.checked)} className="focus:ring-amber-500 h-4 w-4 text-amber-500 border-gray-300 rounded" />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="tcpa" className="font-medium text-gray-800">Consent to Contact</label>
                <p className="text-gray-500 text-xs mt-1">{data.consent.text}</p>
            </div>
        </div>
        {errors.tcpa && <p className="mt-2 text-xs text-red-600">{errors.tcpa}</p>}
      </div>
    </div>
);


const App: React.FC = () => {
    const {
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
    } = useLeadForm();

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <Step1 data={data} updateField={updateField} errors={errors} />;
            case 1: return <Step2 data={data} updateField={updateField} errors={errors} />;
            case 2: return <Step3 data={data} updateField={updateField} errors={errors} />;
            case 3: return <Step4 data={data} updateField={updateField} errors={errors} />;
            default: return <div>Unknown Step</div>;
        }
    };

    if (submittedLeadId) {
        if(SUCCESS_REDIRECT_URL) {
            window.location.href = SUCCESS_REDIRECT_URL;
            return <div className="text-center p-8"><p>Redirecting...</p></div>;
        }
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-8">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Thank You!</h2>
                    <p className="mt-2 text-gray-600">Your moving quote request has been submitted. We'll be in touch shortly.</p>
                    <p className="mt-1 text-xs text-gray-400">Lead ID: {submittedLeadId}</p>
                    <button onClick={resetForm} className="mt-6 bg-amber-500 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-900">Get Your Free Moving Quote</h1>
                    <p className="text-center text-gray-500 mb-6">Fast, free, and no obligation.</p>
                    
                    <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
                    
                    <form onSubmit={handleSubmit} noValidate>
                        {/* Honeypot field for spam prevention. 'nickname' is a common bot target */}
                        <div className="hidden">
                            <label htmlFor="nickname">Nickname</label>
                            <input
                                id="nickname"
                                type="text"
                                value={data.honeypot_nickname}
                                onChange={(e) => updateField('honeypot_nickname', '', e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="min-h-[380px]">
                           {renderStepContent()}
                        </div>
                        
                        {submissionError && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                {submissionError}
                            </div>
                        )}

                        <div className="mt-8 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 0 || isSubmitting}
                                className="bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={isSubmitting}
                                    className="bg-amber-500 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-amber-500 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:bg-amber-300 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : 'Get My Quote'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;