import { z } from 'zod';

// Form validation schema
const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Please enter a valid phone number'),
  'move-date': z.string().min(1, 'Move date is required'),
  'from-zip': z.string().regex(/^\d{5}$/, 'Please enter a valid ZIP code'),
  'to-zip': z.string().regex(/^\d{5}$/, 'Please enter a valid ZIP code'),
  'move-size': z.enum(['studio', '1-bed', '2-bed', '3-bed', '4-bed', '5-bed-plus', 'office']),
  'service-type': z.enum(['full-service', 'labor-only', 'hybrid']),
  'special-items': z.array(z.string()).optional(),
  'from-floor': z.string().optional(),
  'to-floor': z.string().optional(),
  'budget': z.string().optional(),
  'additional-info': z.string().max(1000).optional(),
  'cf-turnstile-response': z.string().min(1, 'Security verification required')
});

// Rate limiting storage (in memory for now, should use KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const key = `rate_limit_${ip}`;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + hourInMs });
    return true;
  }

  if (existing.count >= 5) { // 5 submissions per hour
    return false;
  }

  existing.count++;
  return true;
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secret,
        response: token,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}

async function storeSubmission(data: any, env: any): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const dateKey = timestamp.split('T')[0]; // YYYY-MM-DD
    const submissionKey = `submissions/${dateKey}.jsonl`;

    // Create submission record
    const submission = {
      id: crypto.randomUUID(),
      timestamp,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        moveDate: data['move-date'],
        fromZip: data['from-zip'],
        toZip: data['to-zip'],
        moveSize: data['move-size'],
        serviceType: data['service-type'],
        specialItems: data['special-items'] || [],
        fromFloor: data['from-floor'],
        toFloor: data['to-floor'],
        budget: data.budget,
        additionalInfo: data['additional-info']
      }
    };

    // Get existing submissions for the day
    const existing = await env.R2_BUCKET.get(submissionKey);
    const existingData = existing ? await existing.text() : '';

    // Append new submission as JSONL
    const newLine = JSON.stringify(submission) + '\n';
    const updatedData = existingData + newLine;

    // Store back to R2
    await env.R2_BUCKET.put(submissionKey, updatedData, {
      httpMetadata: {
        contentType: 'application/jsonlines',
      },
    });

    console.log(`Stored submission ${submission.id} to ${submissionKey}`);
  } catch (error) {
    console.error('Failed to store submission:', error);
    throw new Error('Failed to save submission');
  }
}

async function sendNotification(data: any, env: any): Promise<void> {
  // Email notification would go here
  // Using Resend, SendGrid, or similar service
  console.log('Email notification would be sent for:', data.email);
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';

    // Check rate limiting
    const rateLimitPassed = await checkRateLimit(clientIP);
    if (!rateLimitPassed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '3600'
        }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());

    // Handle special-items array
    if (formData.has('special-items')) {
      rawData['special-items'] = formData.getAll('special-items');
    }

    // Check honeypot
    if (formData.get('website')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Spam detected'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate form data
    const validationResult = FormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid form data',
        details: validationResult.error.issues
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const validatedData = validationResult.data;

    // Verify Turnstile
    const turnstileValid = await verifyTurnstile(
      validatedData['cf-turnstile-response'],
      env.TURNSTILE_SECRET_KEY
    );

    if (!turnstileValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Security verification failed. Please try again.'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Store submission
    await storeSubmission(validatedData, env);

    // Send notification
    await sendNotification(validatedData, env);

    return new Response(JSON.stringify({
      success: true,
      message: 'Quote request submitted successfully. You will receive quotes from movers within 2 hours.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Form submission error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// Handle OPTIONS for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};