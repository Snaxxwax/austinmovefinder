// Backend API Service for Austin Move Finder
// Handles communication between React frontend and Express backend

interface Quote {
  id?: number;
  customer_id?: number;
  move_type: 'local' | 'long-distance' | 'commercial' | 'storage';
  move_date: string;
  from_address: string;
  to_address?: string;
  estimated_size: 'studio' | '1br' | '2br' | '3br' | '4br+' | 'commercial';
  special_items?: string;
  notes?: string;
  status?: 'pending' | 'quoted' | 'booked' | 'completed' | 'cancelled';
  estimated_cost?: number;
  final_cost?: number;
  created_at?: string;
  updated_at?: string;
}

interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

interface DetectedItem {
  id?: number;
  quote_id?: number;
  item_label: string;
  confidence_score: number;
  quantity?: number;
  estimated_cost?: number;
  created_at?: string;
}

interface MediaFile {
  id?: number;
  quote_id?: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  processed?: boolean;
  created_at?: string;
}

interface QuoteRequest {
  customer: Customer;
  quote: Omit<Quote, 'id' | 'customer_id' | 'created_at' | 'updated_at'>;
  files?: File[];
}

interface QuoteResponse {
  success: boolean;
  data?: {
    quote: Quote;
    customer: Customer;
    estimated_cost: number;
    detected_items?: DetectedItem[];
    media_files?: MediaFile[];
  };
  error?: string;
  message?: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'error';
  timestamp: string;
  services: {
    database: string;
    email: string;
    ai_detection: string;
    server: string;
  };
  version: string;
  environment: string;
}

class BackendApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Determine backend URL based on environment
    this.baseUrl = this.getBackendUrl();
    this.timeout = 30000; // 30 seconds for uploads
  }

  private getBackendUrl(): string {
    // In development, use local backend
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    }

    // In production, use production backend URL
    return import.meta.env.VITE_BACKEND_URL || 'https://api.austinmovefinder.com';
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = this.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Health check to verify backend is available
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`, {
        method: 'GET',
      }, 10000); // 10 second timeout for health check

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error(`Backend service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new quote with customer information
  async createQuote(quoteRequest: QuoteRequest): Promise<QuoteResponse> {
    try {
      console.log('🚀 Creating quote with backend...', quoteRequest);

      // First, create the quote
      const quoteData = {
        name: quoteRequest.customer.name,
        email: quoteRequest.customer.email,
        phone: quoteRequest.customer.phone,
        move_type: quoteRequest.quote.move_type,
        move_date: quoteRequest.quote.move_date,
        from_address: quoteRequest.quote.from_address,
        to_address: quoteRequest.quote.to_address || '',
        estimated_size: quoteRequest.quote.estimated_size,
        special_items: quoteRequest.quote.special_items || '',
        notes: quoteRequest.quote.notes || '',
      };

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to create quote: ${errorData.error || response.statusText}`);
      }

      const result: QuoteResponse = await response.json();
      console.log('✅ Quote created successfully:', result);

      // If files are provided, upload them
      if (quoteRequest.files && quoteRequest.files.length > 0 && result.data?.quote.id) {
        try {
          await this.uploadMediaFiles(result.data.quote.id, quoteRequest.files);
          console.log('✅ Media files uploaded successfully');
        } catch (uploadError) {
          console.warn('⚠️ Media upload failed, but quote was created:', uploadError);
          // Don't fail the entire request if media upload fails
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to create quote:', error);
      throw error;
    }
  }

  // Upload media files for a quote
  async uploadMediaFiles(quoteId: number, files: File[]): Promise<{ success: boolean; uploaded: number }> {
    try {
      console.log(`📁 Uploading ${files.length} files for quote ${quoteId}...`);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('media', file);
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/upload/${quoteId}`,
        {
          method: 'POST',
          body: formData,
        },
        60000 // 60 seconds for file uploads
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(`Media upload failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Files uploaded successfully:', result);

      return { success: true, uploaded: files.length };
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      throw error;
    }
  }

  // Get quote details by ID
  async getQuote(quoteId: number): Promise<QuoteResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/quotes/${quoteId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Quote not found');
        }
        throw new Error(`Failed to fetch quote: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch quote:', error);
      throw error;
    }
  }

  // Submit quote for processing (triggers email notifications)
  async submitQuote(quoteId: number): Promise<QuoteResponse> {
    try {
      console.log(`📧 Submitting quote ${quoteId} for processing...`);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/quotes/${quoteId}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Submit failed' }));
        throw new Error(`Failed to submit quote: ${errorData.error || response.statusText}`);
      }

      const result: QuoteResponse = await response.json();
      console.log('✅ Quote submitted successfully:', result);

      return result;
    } catch (error) {
      console.error('❌ Failed to submit quote:', error);
      throw error;
    }
  }

  // Add detected items to a quote
  async addDetectedItems(quoteId: number, items: DetectedItem[]): Promise<{ success: boolean; items_added: number }> {
    try {
      console.log(`🤖 Adding ${items.length} detected items to quote ${quoteId}...`);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/quotes/${quoteId}/items`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add items' }));
        throw new Error(`Failed to add detected items: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Detected items added successfully:', result);

      return result.data;
    } catch (error) {
      console.error('❌ Failed to add detected items:', error);
      throw error;
    }
  }

  // Check if backend is available (for graceful degradation)
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // Fallback email service using EmailJS (when backend is unavailable)
  async sendEmailFallback(quoteData: QuoteRequest): Promise<boolean> {
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      console.warn('EmailJS not configured for fallback');
      return false;
    }

    try {
      // Dynamically import EmailJS
      const emailjs = await import('@emailjs/browser');

      await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        {
          customer_name: quoteData.customer.name,
          customer_email: quoteData.customer.email,
          customer_phone: quoteData.customer.phone,
          move_type: quoteData.quote.move_type,
          move_date: quoteData.quote.move_date,
          from_address: quoteData.quote.from_address,
          to_address: quoteData.quote.to_address || 'Not specified',
          estimated_size: quoteData.quote.estimated_size,
          special_items: quoteData.quote.special_items || 'None',
          notes: quoteData.quote.notes || 'None',
          submission_time: new Date().toLocaleString(),
        },
        emailJsPublicKey
      );

      console.log('✅ Fallback email sent via EmailJS');
      return true;
    } catch (error) {
      console.error('❌ EmailJS fallback failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendApi = new BackendApiService();

// Export types for use in components
export type {
  Quote,
  Customer,
  DetectedItem,
  MediaFile,
  QuoteRequest,
  QuoteResponse,
  HealthCheckResponse,
};