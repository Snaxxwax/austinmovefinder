
# Google Opal Flow: Moving Lead Processing

This document outlines the step-by-step process for a Google Opal flow designed to handle incoming moving leads from a webhook.

---

### **How to Deploy**

1.  **React App**:
    *   Build the React application (`npm run build`).
    *   Deploy the static files (from the `dist` or `build` folder) to your hosting provider (e.g., Netlify, Vercel, Firebase Hosting).
    *   Set the `OPAL_WEBHOOK_URL` and `OPAL_WEBHOOK_TOKEN` in your environment variables or directly in the `leadService.ts` file.
    *   Optionally, configure `RECAPTCHA_SITE_KEY` and other constants in `App.tsx`.

2.  **Opal Flow**:
    *   In Google Opal, create a new flow.
    *   Set up the "HTTP Webhook" trigger as the first step. Opal will provide you with a unique URL; this is your `OPAL_WEBHOOK_URL`.
    *   Add the subsequent steps (Validate, Google Sheets, Firestore, etc.) as described below, connecting them in order.
    *   Configure each tool with the required credentials (e.g., connect your Google account for Sheets, Firestore, and Gmail).
    *   For buyer webhooks, add the URLs and shared secrets as environment variables in Opal for security.
    *   Deploy the Opal flow.

---

## **Flow Steps**

### **1. Trigger: HTTP Webhook**
*   **Tool**: `Webhook`
*   **Method**: `POST`
*   **Path**: `/lead` (or use the default path provided by Opal)
*   **Configuration**:
    *   Opal generates a unique URL for this trigger. This URL is used as `OPAL_WEBHOOK_URL` in the React app.
    *   **Security**: Configure the webhook to require an `X-Webhook-Token` header. The value should match the `OPAL_WEBHOOK_TOKEN` from the React app.
    *   The webhook receives the JSON payload from the form submission.

### **2. Validate & Normalize Data**
*   **Tool**: `Code` (JavaScript/TypeScript)
*   **Description**: A script to validate the incoming payload, normalize data, and prepare it for subsequent steps.
*   **Logic**:
    1.  Parse the JSON body from the trigger (`trigger.body`).
    2.  **Generate `lead_id`**: `lead_id = crypto.randomUUID()`.
    3.  **Add `timestamp`**: `timestamp = new Date().toISOString()`.
    4.  **Set `ip`**: `ip = trigger.headers['x-forwarded-for'] || trigger.source_ip`.
    5.  **Validate Required Fields**: Check for `first_name`, `last_name`, `from_zip`, etc., according to the JSON schema. If validation fails, use `return flow.fail({ok: false, error: 'validation_failed'}, { statusCode: 400 })`.
    6.  **Normalize Phone**: If `prospect.phone` exists, ensure it matches the E.164 format. You can use a regex or a simple library to clean it up (e.g., remove `(`, `)`, `-`, ` ` and ensure it starts with `+`).
    7.  **Normalize ZIPs**: Ensure `from_zip` and `to_zip` are exactly 5 digits.
    8.  Return the enriched and validated lead object for the next steps.

### **3. Google Sheets: Append Row**
*   **Tool**: `Google Sheets`
*   **Action**: `Append a Row`
*   **Configuration**:
    *   **Spreadsheet**: Select your "LeadLog" spreadsheet.
    *   **Sheet**: Select the specific sheet (e.g., "Sheet1").
    *   **Row Data**: Map the fields from the validated lead object (output of Step 2) to the corresponding sheet columns in the specified order:
        `timestamp, lead_id, first_name, last_name, email, phone, from_zip, to_zip, date, ...etc.`

### **4. Firestore: Upsert Document**
*   **Tool**: `Firestore`
*   **Action**: `Create/Update Document` (Upsert)
*   **Configuration**:
    *   **Collection**: `leads`
    *   **Document ID**: Use the `lead_id` generated in Step 2.
    *   **Payload**: Pass the entire validated lead JSON object from Step 2 as the document data. This stores a complete record of the lead.

### **5. Gmail: Send Notifications**
*   **Tool**: `Gmail`
*   **Action**: `Send an Email` (this step might be duplicated for owner vs. buyers or use a loop).
*   **Configuration (Owner Notification)**:
    *   **To**: Your email address (e.g., `me@my-moving-site.com`).
    *   **Subject**: `New Lead: {{step_2_output.move.from_zip}} → {{step_2_output.move.to_zip}} | {{step_2_output.move.home_size || step_2_output.move.items_count}}`
    *   **Body**: A formatted summary of the lead details. Use HTML for better readability.
    *   **Reply-To**: `{{step_2_output.prospect.email}}` (if it exists).
*   **Configuration (Buyer Notifications)**:
    *   Use a `Code` block with a loop to iterate through a list of buyer emails (stored as an environment variable).
    *   Inside the loop, call the Gmail tool.
    *   **Logic Flag**: Use a configuration flag (e.g., `MASK_BUYER_DETAILS`) to decide whether to send the full prospect contact info or a masked version (e.g., "Lead from 78701 to 90210 - Respond to claim").

### **6. Optional: Buyer Webhooks**
*   **Tool**: `Code` (JavaScript/TypeScript) with `fetch`
*   **Description**: A script that iterates over a configured list of buyer webhooks and POSTs the lead data.
*   **Configuration**:
    *   Store buyer webhook details (URL, shared secret) in Opal's environment variables for security.
    *   **Logic**:
        1.  Loop through each buyer webhook configuration.
        2.  For each buyer, create a signature: `signature = HMAC-SHA256(payload, buyer.shared_secret)`.
        3.  Make an HTTP POST request using `fetch`:
            *   **URL**: `buyer.url`
            *   **Method**: `POST`
            *   **Headers**: `{'Content-Type': 'application/json', 'X-Lead-Signature': signature}`
            *   **Body**: The full lead JSON payload.
        4.  Implement `try...catch` for each request. On failure, log the error to the Opal run log (`console.error(...)`) and continue to the next buyer. Do not let a single failed webhook stop the flow.

### **7. Success Response**
*   **Tool**: `Webhook Response`
*   **Description**: This is the final step in the main path of the flow.
*   **Configuration**:
    *   **Status Code**: `200`
    *   **Body**: `{"ok": true, "lead_id": "{{step_2_output.lead_id}}"}`
    *   **Content-Type**: `application/json`

### **8. Error Handling**
*   **Description**: Opal has built-in error handling. For custom responses (like the 400 validation error), the `flow.fail()` method in Step 2 handles it. For all other unexpected errors (e.g., Sheets API is down), Opal will catch the exception, log the context, and by default, respond with a 500 error. This matches the required behavior.
