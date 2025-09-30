/**
 * API endpoint for handling quote form submissions
 * Processes form data, validates input, and sends email notifications
 */

import { emailService } from "../../services/email/emailService.js";

export async function POST({ request, url }) {
  try {
    // Parse form data
    const formData = await request.formData();

    // Extract form fields
    const data = {
      // Contact Information
      name: formData.get("name")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),

      // Move Details
      moveDate:
        formData.get("move-date")?.toString() ||
        formData.get("moveDate")?.toString(),
      flexibleDates:
        formData.get("flexible-dates")?.toString() ||
        formData.get("flexibleDates")?.toString(),
      fromZip:
        formData.get("from-zip")?.toString() ||
        formData.get("fromZip")?.toString(),
      toZip:
        formData.get("to-zip")?.toString() || formData.get("toZip")?.toString(),
      moveSize:
        formData.get("move-size")?.toString() ||
        formData.get("moveSize")?.toString(),

      // Service Details
      serviceType: formData.get("service-type")?.toString(),
      packingSupplies: formData.get("packing-supplies") === "on",
      storageNeeded: formData.get("storage-needed") === "on",
      specialItems: formData.getAll("special-items"),
      fromFloor: formData.get("from-floor")?.toString(),
      toFloor: formData.get("to-floor")?.toString(),
      budget: formData.get("budget")?.toString(),
      additionalInfo: formData.get("additional-info")?.toString(),

      // Security and Metadata
      turnstileResponse: formData.get("cf-turnstile-response")?.toString(),
      honeypot: formData.get("website")?.toString(),
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
      ipAddress:
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown",
      submissionTime: new Date().toISOString(),
    };

    // Honeypot spam protection
    if (data.honeypot && data.honeypot.trim() !== "") {
      console.warn("Spam attempt detected:", {
        ip: data.ipAddress,
        honeypot: data.honeypot,
        userAgent: data.userAgent,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Submission failed validation",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "moveDate",
      "fromZip",
      "toZip",
      "moveSize",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email address format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate phone format (assume US format)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid phone number format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate ZIP codes
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(data.fromZip) || !zipRegex.test(data.toZip)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid ZIP code format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate move date (must be in the future)
    const moveDate = new Date(data.moveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (moveDate < today) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Move date must be today or in the future",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Verify Cloudflare Turnstile (in production)
    if (data.turnstileResponse) {
      const turnstileValid = await verifyTurnstile(
        data.turnstileResponse,
        data.ipAddress,
      );
      if (!turnstileValid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Security verification failed. Please try again.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Process the quote request
    const quoteId = await processQuoteRequest(data);

    // Send confirmation email to customer
    try {
      await emailService.sendCustomerConfirmation(data, quoteId);
      console.log("Customer confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send customer confirmation email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    // Send notification to business
    try {
      await emailService.sendBusinessNotification(data, quoteId);
      console.log("Business notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send business notification email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    // Log successful submission
    console.log("Quote request processed successfully:", {
      quoteId,
      email: data.email,
      moveDate: data.moveDate,
      fromZip: data.fromZip,
      toZip: data.toZip,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request submitted successfully",
        quoteId: quoteId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Quote submission error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Verify Cloudflare Turnstile response
 */
async function verifyTurnstile(response, remoteip) {
  try {
    const secret = import.meta.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.warn("Turnstile secret key not configured");
      return true; // Allow in development
    }

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secret,
          response: response,
          remoteip: remoteip,
        }),
      },
    );

    const result = await verifyResponse.json();
    return result.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

/**
 * Process the quote request and generate a unique ID
 */
async function processQuoteRequest(data) {
  // Generate unique quote ID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const quoteId = `AMF-${timestamp}-${random}`.toUpperCase();

  // Here you would typically:
  // 1. Save to database
  // 2. Calculate initial estimates
  // 3. Queue for partner notifications
  // 4. Schedule follow-up tasks

  // For now, just log the data (in production, save to database)
  console.log("Quote request data:", {
    quoteId,
    ...data,
  });

  return quoteId;
}
