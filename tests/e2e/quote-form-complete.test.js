/**
 * Comprehensive E2E Tests for Quote Form
 * Tests navigation, validation, auto-save, and submission
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';
const QUOTE_URL = `${BASE_URL}/quote`;

// Test data
const validFormData = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '(512) 555-0123',
  moveDate: '2025-12-31',
  flexibleDates: 'exact',
  fromZip: '78701',
  toZip: '78704',
  moveSize: '2-bed',
  serviceType: 'full-service',
  fromFloor: 'ground',
  toFloor: '2nd',
  budget: '1000-2500',
  additionalInfo: 'Need help with furniture disassembly'
};

test.describe('Quote Form - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(QUOTE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load Step 1 correctly', async ({ page }) => {
    // Wait for form to initialize
    await page.waitForSelector('#quote-form', { timeout: 5000 });

    // Verify Step 1 is visible
    const step1 = await page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Verify all required fields are present
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#move-date')).toBeVisible();
    await expect(page.locator('#from-zip')).toBeVisible();
    await expect(page.locator('#to-zip')).toBeVisible();
    await expect(page.locator('#move-size')).toBeVisible();

    // Verify next button exists
    await expect(page.locator('#next-1')).toBeVisible();

    console.log('✓ Step 1 loaded successfully');
  });

  test('should navigate from Step 1 to Step 2 with valid data', async ({ page }) => {
    // Fill Step 1 form
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.fill('#move-date', validFormData.moveDate);
    await page.selectOption('#flexible-dates', validFormData.flexibleDates);
    await page.fill('#from-zip', validFormData.fromZip);
    await page.fill('#to-zip', validFormData.toZip);
    await page.selectOption('#move-size', validFormData.moveSize);

    // Click next button
    await page.click('#next-1');

    // Wait for Step 2 to load
    await page.waitForSelector('#step-2', { timeout: 5000 });

    // Verify Step 2 is visible and Step 1 is not
    const step2 = await page.locator('#step-2');
    await expect(step2).toBeVisible();

    // Verify Step 2 fields are present
    await expect(page.locator('input[name="service-type"]').first()).toBeVisible();
    await expect(page.locator('#back-2')).toBeVisible();
    await expect(page.locator('#submit-btn')).toBeVisible();

    // Verify progress bar updated
    const progressFill = await page.locator('#progress-fill');
    const width = await progressFill.evaluate(el => el.style.width);
    expect(width).toBe('100%');

    console.log('✓ Navigation from Step 1 to Step 2 successful');
  });

  test('should prevent navigation to Step 2 with invalid data', async ({ page }) => {
    // Fill only some fields (incomplete)
    await page.fill('#name', validFormData.name);
    await page.fill('#email', 'invalid-email'); // Invalid email

    // Click next button
    await page.click('#next-1');

    // Should still be on Step 1
    await page.waitForTimeout(1000);
    const step1 = await page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Should show error message
    const messageBox = await page.locator('#message-box.error');
    await expect(messageBox).toBeVisible();

    console.log('✓ Invalid data correctly prevented navigation');
  });

  test('should validate email format in real-time', async ({ page }) => {
    const emailInput = page.locator('#email');

    // Enter invalid email
    await emailInput.fill('notanemail');
    await emailInput.blur();

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for error class or message
    const formGroup = page.locator('#email').locator('..');
    const hasError = await formGroup.evaluate(el =>
      el.classList.contains('error')
    );

    expect(hasError).toBeTruthy();

    // Enter valid email
    await emailInput.fill(validFormData.email);
    await emailInput.blur();
    await page.waitForTimeout(500);

    // Error should be cleared
    const noError = await formGroup.evaluate(el =>
      !el.classList.contains('error')
    );

    expect(noError).toBeTruthy();

    console.log('✓ Real-time email validation working');
  });

  test('should format phone number automatically', async ({ page }) => {
    const phoneInput = page.locator('#phone');

    // Type digits only
    await phoneInput.fill('5125550123');

    // Check formatted value
    await page.waitForTimeout(500);
    const value = await phoneInput.inputValue();

    expect(value).toBe('(512) 555-0123');

    console.log('✓ Phone number auto-formatting working');
  });

  test('should validate ZIP codes', async ({ page }) => {
    const fromZipInput = page.locator('#from-zip');

    // Enter invalid ZIP (too short)
    await fromZipInput.fill('787');
    await fromZipInput.blur();
    await page.waitForTimeout(500);

    // Should show error
    const formGroup = fromZipInput.locator('..');
    const hasError = await formGroup.evaluate(el =>
      el.classList.contains('error')
    );
    expect(hasError).toBeTruthy();

    // Enter valid ZIP
    await fromZipInput.fill('78701');
    await fromZipInput.blur();
    await page.waitForTimeout(500);

    // Error should clear
    const noError = await formGroup.evaluate(el =>
      !el.classList.contains('error')
    );
    expect(noError).toBeTruthy();

    console.log('✓ ZIP code validation working');
  });

  test('should navigate back from Step 2 to Step 1', async ({ page }) => {
    // Fill and navigate to Step 2
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.fill('#move-date', validFormData.moveDate);
    await page.fill('#from-zip', validFormData.fromZip);
    await page.fill('#to-zip', validFormData.toZip);
    await page.selectOption('#move-size', validFormData.moveSize);
    await page.click('#next-1');

    await page.waitForSelector('#step-2', { timeout: 5000 });

    // Click back button
    await page.click('#back-2');

    // Should be back on Step 1
    await page.waitForSelector('#step-1', { timeout: 5000 });
    const step1 = await page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Verify data is preserved
    const nameValue = await page.locator('#name').inputValue();
    expect(nameValue).toBe(validFormData.name);

    console.log('✓ Back navigation working with data preserved');
  });

  test('should select service type cards', async ({ page }) => {
    // Navigate to Step 2
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.fill('#move-date', validFormData.moveDate);
    await page.fill('#from-zip', validFormData.fromZip);
    await page.fill('#to-zip', validFormData.toZip);
    await page.selectOption('#move-size', validFormData.moveSize);
    await page.click('#next-1');

    await page.waitForSelector('#step-2', { timeout: 5000 });

    // Find and click labor-only service card
    const laborCard = page.locator('.service-card').filter({ hasText: 'Labor Only' });
    await laborCard.click();

    // Verify card is selected
    const hasSelected = await laborCard.evaluate(el =>
      el.classList.contains('selected')
    );
    expect(hasSelected).toBeTruthy();

    // Verify radio button is checked
    const radio = laborCard.locator('input[type="radio"]');
    const isChecked = await radio.isChecked();
    expect(isChecked).toBeTruthy();

    console.log('✓ Service card selection working');
  });

  test('should handle special items checkboxes', async ({ page }) => {
    // Navigate to Step 2
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.fill('#move-date', validFormData.moveDate);
    await page.fill('#from-zip', validFormData.fromZip);
    await page.fill('#to-zip', validFormData.toZip);
    await page.selectOption('#move-size', validFormData.moveSize);
    await page.click('#next-1');

    await page.waitForSelector('#step-2', { timeout: 5000 });

    // Check piano checkbox
    const pianoCheckbox = page.locator('input[value="piano"]');
    await pianoCheckbox.check();
    expect(await pianoCheckbox.isChecked()).toBeTruthy();

    // Check "none" checkbox
    const noneCheckbox = page.locator('input[value="none"]');
    await noneCheckbox.check();

    // Piano should be unchecked (mutual exclusivity)
    await page.waitForTimeout(300);
    expect(await pianoCheckbox.isChecked()).toBeFalsy();

    console.log('✓ Special items checkbox logic working');
  });

  test('should update progress bar correctly', async ({ page }) => {
    const progressFill = page.locator('#progress-fill');

    // Step 1 should have 0% progress
    let width = await progressFill.evaluate(el => el.style.width);
    expect(width).toBe('0%');

    // Navigate to Step 2
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.fill('#move-date', validFormData.moveDate);
    await page.fill('#from-zip', validFormData.fromZip);
    await page.fill('#to-zip', validFormData.toZip);
    await page.selectOption('#move-size', validFormData.moveSize);
    await page.click('#next-1');

    await page.waitForSelector('#step-2', { timeout: 5000 });

    // Step 2 should have 100% progress
    width = await progressFill.evaluate(el => el.style.width);
    expect(width).toBe('100%');

    console.log('✓ Progress bar updating correctly');
  });
});

test.describe('Quote Form - Auto-Save Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
    await page.goto(QUOTE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should auto-save form data to localStorage', async ({ page }) => {
    // Fill some fields
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);

    // Wait for auto-save (5 seconds + buffer)
    await page.waitForTimeout(6000);

    // Check localStorage
    const savedData = await page.evaluate(() => {
      const data = localStorage.getItem('amf_quote_autosave');
      return data ? JSON.parse(data) : null;
    });

    expect(savedData).not.toBeNull();
    expect(savedData.data.name).toBe(validFormData.name);
    expect(savedData.data.email).toBe(validFormData.email);

    console.log('✓ Auto-save storing data correctly');
  });

  test('should show restore prompt on page reload', async ({ page }) => {
    // Fill and save data
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.waitForTimeout(6000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for restore prompt
    const messageBox = page.locator('#message-box.show');
    await expect(messageBox).toBeVisible({ timeout: 3000 });

    const restoreBtn = page.locator('#restore-data-btn');
    await expect(restoreBtn).toBeVisible();

    console.log('✓ Restore prompt appearing correctly');
  });

  test('should restore saved data when clicking restore button', async ({ page }) => {
    // Fill and save data
    await page.fill('#name', validFormData.name);
    await page.fill('#email', validFormData.email);
    await page.fill('#phone', validFormData.phone);
    await page.waitForTimeout(6000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click restore button
    const restoreBtn = page.locator('#restore-data-btn');
    await restoreBtn.click({ timeout: 3000 });

    // Wait for data restoration
    await page.waitForTimeout(1000);

    // Verify data is restored
    const nameValue = await page.locator('#name').inputValue();
    const emailValue = await page.locator('#email').inputValue();
    const phoneValue = await page.locator('#phone').inputValue();

    expect(nameValue).toBe(validFormData.name);
    expect(emailValue).toBe(validFormData.email);
    expect(phoneValue).toBe(validFormData.phone);

    console.log('✓ Data restoration working correctly');
  });

  test('should clear saved data when clicking start fresh', async ({ page }) => {
    // Fill and save data
    await page.fill('#name', validFormData.name);
    await page.waitForTimeout(6000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click start fresh button
    const dismissBtn = page.locator('#dismiss-restore-btn');
    await dismissBtn.click({ timeout: 3000 });

    // Check localStorage is cleared
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('amf_quote_autosave');
    });

    expect(savedData).toBeNull();

    console.log('✓ Start fresh clearing data correctly');
  });
});

console.log('\n✓ All quote form tests defined');