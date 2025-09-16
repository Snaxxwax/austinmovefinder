import nodemailer from 'nodemailer';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendQuoteNotification(quoteData) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      moveType,
      moveDate,
      fromAddress,
      toAddress,
      estimatedSize,
      specialItems,
      notes,
      detectedItems,
      totalCost,
      mediaFileCount,
      submissionTime
    } = quoteData;

    const subject = `New Moving Quote Request - ${customerName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #00a0dc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .quote-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .customer-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .cost-highlight { background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; color: #155724; }
          .items-list { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; }
          .footer { background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚚 Austin Move Finder</h1>
          <h2>New Quote Request</h2>
        </div>
        
        <div class="content">
          <div class="cost-highlight">
            💰 Estimated Cost: $${totalCost.toLocaleString()}
          </div>
          
          <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>
            <p><strong>Submitted:</strong> ${submissionTime}</p>
          </div>
          
          <div class="quote-details">
            <h3>📋 Move Details</h3>
            <p><strong>Move Type:</strong> ${moveType}</p>
            <p><strong>Move Date:</strong> ${moveDate}</p>
            <p><strong>From:</strong> ${fromAddress}</p>
            <p><strong>To:</strong> ${toAddress || 'Not specified'}</p>
            <p><strong>Estimated Size:</strong> ${estimatedSize}</p>
            ${specialItems ? `<p><strong>Special Items:</strong> ${specialItems}</p>` : ''}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            <p><strong>Media Files:</strong> ${mediaFileCount} files uploaded</p>
          </div>
          
          ${detectedItems ? `
          <div class="items-list">
            <h3>🤖 AI Detected Items</h3>
            <p>${detectedItems}</p>
          </div>
          ` : ''}
          
          <div style="margin: 20px 0; padding: 15px; border: 2px solid #00a0dc; border-radius: 5px;">
            <h3>📞 Next Steps</h3>
            <ol>
              <li>Review customer media files and detected items</li>
              <li>Contact customer within 2 hours to confirm details</li>
              <li>Provide refined quote based on specific requirements</li>
              <li>Schedule move if customer accepts</li>
            </ol>
          </div>
        </div>
        
        <div class="footer">
          <p>Austin Move Finder - Making Austin Moves Smooth and Stress-Free</p>
          <p>📧 ${process.env.FROM_EMAIL} | 📞 (512) 555-MOVE</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@austinmovefinder.com',
      to: process.env.TO_EMAIL || 'quotes@austinmovefinder.com',
      subject,
      html: htmlContent,
      replyTo: customerEmail
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendCustomerConfirmation(quoteData) {
    const {
      customerName,
      customerEmail,
      moveType,
      moveDate,
      fromAddress,
      toAddress,
      detectedItems,
      totalCost,
      submissionTime
    } = quoteData;

    const subject = 'Your Austin Move Quote Request Received!';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #00a0dc, #8cc63f); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; max-width: 600px; margin: 0 auto; }
          .quote-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00a0dc; }
          .cost-highlight { background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #155724; margin: 20px 0; }
          .next-steps { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .ai-badge { background: #8cc63f; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
          .contact-info { background: #e9ecef; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { background: #6c757d; color: white; padding: 20px; text-align: center; font-size: 14px; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><span class="emoji">🚚</span> Austin Move Finder</h1>
          <h2>Your Quote Request Received!</h2>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>Thank you for choosing Austin Move Finder! We've received your moving quote request and our AI system has generated an initial estimate.</p>
          
          <div class="cost-highlight">
            <span class="emoji">💰</span> Estimated Cost: $${totalCost.toLocaleString()}
          </div>
          
          <div class="quote-summary">
            <h3><span class="emoji">📋</span> Quote Summary</h3>
            <p><strong>Move Type:</strong> ${moveType}</p>
            <p><strong>Move Date:</strong> ${moveDate}</p>
            <p><strong>From:</strong> ${fromAddress}</p>
            <p><strong>To:</strong> ${toAddress || 'Not specified'}</p>
            <p><strong>Submitted:</strong> ${submissionTime}</p>
          </div>
          
          ${detectedItems ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4><span class="emoji">🤖</span> AI Detected Items <span class="ai-badge">AI POWERED</span></h4>
            <p>${detectedItems}</p>
          </div>
          ` : ''}
          
          <div class="next-steps">
            <h3><span class="emoji">📱</span> What Happens Next?</h3>
            <ol>
              <li><strong>Review & Refinement:</strong> Our moving specialists will review your photos/videos and contact you within 2 hours</li>
              <li><strong>Detailed Quote:</strong> You'll receive a refined quote based on your specific items and requirements</li>
              <li><strong>Scheduling:</strong> We'll discuss available moving dates and time slots</li>
              <li><strong>Confirmation:</strong> Once you approve, we'll lock in your Austin move!</li>
            </ol>
          </div>
          
          <div class="contact-info">
            <h3><span class="emoji">📞</span> Need to Reach Us?</h3>
            <p><strong>Phone:</strong> <a href="tel:512-555-MOVE" style="color: #00a0dc; text-decoration: none;">(512) 555-MOVE</a></p>
            <p><strong>Email:</strong> <a href="mailto:hello@austinmovefinder.com" style="color: #00a0dc; text-decoration: none;">hello@austinmovefinder.com</a></p>
            <p><strong>Hours:</strong> Monday-Saturday 8AM-7PM, Sunday 10AM-5PM</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #00a0dc, #8cc63f); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3><span class="emoji">🌟</span> Why Choose Austin Move Finder?</h3>
            <p>✓ Local Austin experts who know the city<br>
            ✓ AI-powered accurate estimates<br>
            ✓ Fully licensed and insured<br>
            ✓ Same-day quotes and scheduling<br>
            ✓ Stress-free moving experience</p>
          </div>
          
          <p>We look forward to making your Austin move smooth and stress-free!</p>
          
          <p>Best regards,<br>
          <strong>The Austin Move Finder Team</strong></p>
        </div>
        
        <div class="footer">
          <p><strong>Austin Move Finder</strong> - Your Trusted Austin Moving Partner</p>
          <p>📧 hello@austinmovefinder.com | 📞 (512) 555-MOVE</p>
          <p>Serving Austin, Cedar Park, Round Rock, Pflugerville & Surrounding Areas</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@austinmovefinder.com',
      to: customerEmail,
      subject,
      html: htmlContent,
      replyTo: process.env.TO_EMAIL || 'hello@austinmovefinder.com'
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendQuoteUpdate(customerEmail, quoteData, updateMessage) {
    const subject = `Quote Update - Austin Move Finder`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #00a0dc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; max-width: 600px; margin: 0 auto; }
          .update-message { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚚 Austin Move Finder</h1>
          <h2>Quote Update</h2>
        </div>
        
        <div class="content">
          <p>Dear ${quoteData.customerName},</p>
          
          <div class="update-message">
            <h3>📝 Update to Your Quote</h3>
            <p>${updateMessage}</p>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us at (512) 555-MOVE or reply to this email.</p>
          
          <p>Best regards,<br>
          Austin Move Finder Team</p>
        </div>
        
        <div class="footer">
          <p>Austin Move Finder | 📧 hello@austinmovefinder.com | 📞 (512) 555-MOVE</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@austinmovefinder.com',
      to: customerEmail,
      subject,
      html: htmlContent
    };

    return await this.transporter.sendMail(mailOptions);
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}