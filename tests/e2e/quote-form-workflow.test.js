/**
 * End-to-End Quote Form Workflow Tests
 * Tests the complete user journey through the quote form
 */

import { test, expect } from "@playwright/test";

test.describe("Quote Form E2E Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to quote page
    await page.goto("/quote");

    // Wait for form to be fully loaded
    await page.waitForSelector("#quote-form");
    await page.waitForSelector("#form-steps-container .form-step.active");
  });

  test("should complete full quote form workflow", async ({ page }) => {
    // Step 1: Fill basic information
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john.doe@example.com");
    await page.fill("#phone", "5125551234");

    // Set move date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    await page.fill("#move-date", dateString);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    // Verify phone formatting
    await expect(page.locator("#phone")).toHaveValue("(512) 555-1234");

    // Navigate to step 2
    await page.click("#next-1");

    // Wait for step 2 to load
    await page.waitForSelector("#step-2.active");

    // Step 2: Select service options
    await page.click('.service-card[data-value=\"full-service\"]');

    // Select special items
    await page.check('input[name=\"special-items\"][value=\"piano\"]');

    // Fill optional fields
    await page.selectOption("#budget", "2500-5000");
    await page.fill("#additional-info", "Please handle piano with extra care.");

    // Wait for Turnstile to load (mock in test environment)
    await page.evaluate(() => {
      // Mock Turnstile success in test environment
      if (window.onTurnstileSuccess) {
        window.onTurnstileSuccess("test-token-123");
      }
    });

    // Submit form
    await page.click("#submit-btn");

    // Wait for success message
    await page.waitForSelector("text=Success!", { timeout: 10000 });

    // Verify success state
    await expect(page.locator("h2")).toContainText("Success!");
    await expect(page.locator("text=Check your email")).toBeVisible();
    await expect(page.locator('a[href=\"/\"]')).toBeVisible();
  });

  test("should show validation errors for empty required fields", async ({
    page,
  }) => {
    // Try to navigate to step 2 without filling required fields
    await page.click("#next-1");

    // Should show error message
    await expect(page.locator(".message-box.error")).toBeVisible();
    await expect(page.locator(".message-box")).toContainText(
      "Please fill in all required fields",
    );

    // Should highlight error fields
    const errorFields = page.locator(".form-group.error");
    await expect(errorFields).toHaveCount(6); // All required fields

    // Should still be on step 1
    await expect(page.locator("#step-1")).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Fill fields with invalid email
    await page.fill("#name", "John Doe");
    await page.fill("#email", "invalid-email");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    // Try to proceed
    await page.click("#next-1");

    // Should show validation error
    await expect(page.locator("#email").closest(".form-group")).toHaveClass(
      /error/,
    );
    await expect(page.locator(".message-box.error")).toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    // Test phone formatting as user types
    await page.fill("#phone", "512");
    await expect(page.locator("#phone")).toHaveValue("(512");

    await page.fill("#phone", "5125555");
    await expect(page.locator("#phone")).toHaveValue("(512) 555");

    await page.fill("#phone", "5125551234");
    await expect(page.locator("#phone")).toHaveValue("(512) 555-1234");

    // Test incomplete phone validation
    await page.fill("#phone", "512555");
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    await page.click("#next-1");

    // Should show phone validation error
    await expect(page.locator("#phone").closest(".form-group")).toHaveClass(
      /error/,
    );
  });

  test("should validate ZIP codes", async ({ page }) => {
    // Test ZIP code formatting
    await page.fill("#from-zip", "abc78701xyz");
    await expect(page.locator("#from-zip")).toHaveValue("78701");

    // Test invalid ZIP length
    await page.fill("#from-zip", "1234");
    await page.blur("#from-zip");

    await expect(page.locator("#from-zip").closest(".form-group")).toHaveClass(
      /error/,
    );
  });

  test("should validate move date", async ({ page }) => {
    // Fill other required fields
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");
    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    // Set past date
    await page.fill("#move-date", "2020-01-01");

    await page.click("#next-1");

    // Should show date validation error
    await expect(page.locator("#move-date").closest(".form-group")).toHaveClass(
      /error/,
    );
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    // Fill step 1 and navigate to step 2
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    await page.click("#next-1");
    await page.waitForSelector("#step-2.active");

    // Use browser back button
    await page.goBack();

    // Should be back on step 1 with data preserved
    await page.waitForSelector("#step-1.active");
    await expect(page.locator("#name")).toHaveValue("John Doe");
    await expect(page.locator("#email")).toHaveValue("john@example.com");
  });

  test("should auto-save form data", async ({ page }) => {
    // Fill some form data
    await page.fill("#name", "Jane Smith");
    await page.fill("#email", "jane@example.com");

    // Wait for auto-save
    await page.waitForTimeout(5500);

    // Check localStorage for saved data
    const savedData = await page.evaluate(() => {
      return localStorage.getItem("amf_quote_autosave");
    });

    expect(savedData).toBeTruthy();
    const parsedData = JSON.parse(savedData);
    expect(parsedData.data.name).toBe("Jane Smith");
    expect(parsedData.data.email).toBe("jane@example.com");
  });

  test("should restore auto-saved data on page reload", async ({ page }) => {
    // Set up auto-saved data
    await page.evaluate(() => {
      const autoSaveData = {
        data: {
          name: "Restored User",
          email: "restored@example.com",
          phone: "(512) 555-9999",
        },
        timestamp: Date.now(),
        step: 1,
      };
      localStorage.setItem("amf_quote_autosave", JSON.stringify(autoSaveData));
    });

    // Reload page
    await page.reload();
    await page.waitForSelector("#quote-form");

    // Should show restore option
    await expect(page.locator(".message-box")).toContainText(
      "previous incomplete form",
    );

    // Click restore
    await page.click("#restore-data-btn");

    // Verify data is restored
    await expect(page.locator("#name")).toHaveValue("Restored User");
    await expect(page.locator("#email")).toHaveValue("restored@example.com");
    await expect(page.locator("#phone")).toHaveValue("(512) 555-9999");
  });

  test("should handle service card selection", async ({ page }) => {
    // Navigate to step 2
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");
    await page.click("#next-1");

    await page.waitForSelector("#step-2.active");

    // Click on different service cards
    const fullServiceCard = page
      .locator(".service-card")
      .filter({ hasText: "Full Service" });
    const laborOnlyCard = page
      .locator(".service-card")
      .filter({ hasText: "Labor Only" });

    await fullServiceCard.click();
    await expect(fullServiceCard).toHaveClass(/selected/);

    await laborOnlyCard.click();
    await expect(laborOnlyCard).toHaveClass(/selected/);
    await expect(fullServiceCard).not.toHaveClass(/selected/);
  });

  test("should handle checkbox logic for special items", async ({ page }) => {
    // Navigate to step 2
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");
    await page.click("#next-1");

    await page.waitForSelector("#step-2.active");

    // Select multiple special items
    await page.check('input[value=\"piano\"]');
    await page.check('input[value=\"pool-table\"]');

    // Verify both are checked
    await expect(page.locator('input[value=\"piano\"]')).toBeChecked();
    await expect(page.locator('input[value=\"pool-table\"]')).toBeChecked();

    // Select \"none\" - should uncheck others
    await page.check('input[value=\"none\"]');

    await expect(page.locator('input[value=\"none\"]')).toBeChecked();
    await expect(page.locator('input[value=\"piano\"]')).not.toBeChecked();
    await expect(page.locator('input[value=\"pool-table\"]')).not.toBeChecked();

    // Select another item - should uncheck \"none\"
    await page.check('input[value=\"safe\"]');

    await expect(page.locator('input[value=\"safe\"]')).toBeChecked();
    await expect(page.locator('input[value=\"none\"]')).not.toBeChecked();
  });

  test("should show loading states during submission", async ({ page }) => {
    // Fill complete form
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");
    await page.click("#next-1");

    await page.waitForSelector("#step-2.active");

    // Mock Turnstile success
    await page.evaluate(() => {
      if (window.onTurnstileSuccess) {
        window.onTurnstileSuccess("test-token-123");
      }
    });

    // Mock slow API response
    await page.route("/api/submit", (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }, 2000);
    });

    // Submit form
    await page.click("#submit-btn");

    // Verify loading state
    await expect(page.locator("#submit-btn")).toHaveClass(/loading/);
    await expect(page.locator("#submit-btn")).toBeDisabled();
    await expect(page.locator(".spinner")).toBeVisible();

    // Wait for success
    await page.waitForSelector("text=Success!", { timeout: 5000 });
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Mock network error
    await page.route("/api/submit", (route) => {
      route.abort("failed");
    });

    // Fill and submit form
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");
    await page.click("#next-1");

    await page.waitForSelector("#step-2.active");

    await page.evaluate(() => {
      if (window.onTurnstileSuccess) {
        window.onTurnstileSuccess("test-token-123");
      }
    });

    await page.click("#submit-btn");

    // Should show network error message
    await expect(page.locator(".message-box.error")).toContainText(
      "Network error",
    );

    // Submit button should be enabled again
    await expect(page.locator("#submit-btn")).not.toBeDisabled();
  });

  test("should be accessible via keyboard navigation", async ({ page }) => {
    // Test tab navigation through form
    await page.keyboard.press("Tab"); // Name field
    await expect(page.locator("#name")).toBeFocused();

    await page.keyboard.press("Tab"); // Email field
    await expect(page.locator("#email")).toBeFocused();

    await page.keyboard.press("Tab"); // Phone field
    await expect(page.locator("#phone")).toBeFocused();

    // Fill required fields with keyboard
    await page.keyboard.type("John Doe");
    await page.keyboard.press("Tab");
    await page.keyboard.type("john@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("5125551234");

    // Continue with other required fields
    await page.keyboard.press("Tab");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.keyboard.type(tomorrow.toISOString().split("T")[0]);

    await page.keyboard.press("Tab");
    await page.keyboard.type("78701");

    await page.keyboard.press("Tab");
    await page.keyboard.type("78704");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Space"); // Open select
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown"); // Select 2-bed
    await page.keyboard.press("Enter");

    // Navigate to step 2 with keyboard
    await page.keyboard.press("Tab"); // Next button
    await page.keyboard.press("Enter");

    await page.waitForSelector("#step-2.active");

    // Test service card keyboard navigation
    await page.keyboard.press("Tab"); // First service card
    await page.keyboard.press("Enter"); // Select it

    const selectedCard = page.locator(".service-card.selected");
    await expect(selectedCard).toBeVisible();
  });

  test("should work on mobile devices", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }

    // Test mobile-specific optimizations
    const formSection = page.locator(".form-section");
    await expect(formSection).toBeVisible();

    // Test touch interactions
    await page.fill("#name", "Mobile User");
    await page.fill("#email", "mobile@example.com");
    await page.fill("#phone", "5125551234");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#move-date", tomorrow.toISOString().split("T")[0]);

    await page.fill("#from-zip", "78701");
    await page.fill("#to-zip", "78704");
    await page.selectOption("#move-size", "2-bed");

    // Test touch on next button
    await page.tap("#next-1");

    await page.waitForSelector("#step-2.active");

    // Test service card touch selection
    await page.tap(".service-card");
    await expect(page.locator(".service-card.selected")).toBeVisible();
  });
});
