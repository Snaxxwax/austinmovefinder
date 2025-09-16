import emailjs from '@emailjs/browser';

interface QuoteEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveType: string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  estimatedSize: string;
  specialItems: string;
  notes: string;
  detectedItems: string;
  totalCost: number;
  mediaFileCount: number;
  submissionTime: string;
}

class EmailService {
  private readonly SERVICE_ID: string;
  private readonly TEMPLATE_ID: string;
  private readonly PUBLIC_KEY: string;

  constructor() {
    this.SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  }

  async sendQuoteEmail(data: QuoteEmailData): Promise<boolean> {
    if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
      console.error('EmailJS configuration missing. Check environment variables.');
      throw new Error('Email service not configured. Please contact support.');
    }

    try {
      const templateParams = {
        to_email: 'your-business-email@example.com', // Your business email
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        move_type: data.moveType,
        move_date: data.moveDate,
        from_address: data.fromAddress || 'Not specified',
        to_address: data.toAddress || 'Not specified',
        estimated_size: data.estimatedSize,
        special_items: data.specialItems || 'None',
        notes: data.notes || 'None',
        detected_items: data.detectedItems,
        total_cost: `$${data.totalCost.toLocaleString()}`,
        media_file_count: data.mediaFileCount,
        submission_time: data.submissionTime,
        // Auto-reply fields
        reply_to: data.customerEmail,
        customer_message: this.generateCustomerMessage(data)
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send quote request. Please try again or contact us directly.');
    }
  }

  private generateCustomerMessage(data: QuoteEmailData): string {
    return `
Dear ${data.customerName},

Thank you for your interest in Austin Move Finder! We've received your moving quote request and our AI system has generated an initial estimate.

📋 QUOTE SUMMARY:
• Estimated Cost: $${data.totalCost.toLocaleString()}
• Move Type: ${data.moveType}
• Move Date: ${data.moveDate}
• From: ${data.fromAddress || 'Not specified'}
• To: ${data.toAddress || 'Not specified'}

🤖 AI DETECTED ITEMS:
${data.detectedItems}

📱 NEXT STEPS:
Our moving specialists will review your photos/videos and contact you within 2 hours with:
• Refined pricing based on your specific items
• Available moving dates and time slots
• Answers to any questions you may have

📞 CONTACT US:
Phone: (512) 555-MOVE
Email: hello@austinmovefinder.com

We look forward to making your Austin move smooth and stress-free!

Best regards,
Austin Move Finder Team
    `.trim();
  }

  // Send confirmation email to customer
  async sendCustomerConfirmation(data: QuoteEmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: data.customerEmail,
        customer_name: data.customerName,
        customer_message: this.generateCustomerMessage(data),
        from_name: 'Austin Move Finder',
        reply_to: 'hello@austinmovefinder.com'
      };

      await emailjs.send(
        this.SERVICE_ID,
        'template_customer_confirmation', // Separate template for customer
        templateParams,
        this.PUBLIC_KEY
      );

      return true;
    } catch (error) {
      console.error('Failed to send customer confirmation:', error);
      // Don't throw error - business email is more important
      return false;
    }
  }
}

export { EmailService, type QuoteEmailData };