/**
 * @tweakable The maximum height of the logo in pixels.
 */
const logoMaxHeight = 100;
document.documentElement.style.setProperty('--logo-max-height', `${logoMaxHeight}px`);

/**
 * @tweakable The background color of the quote form.
 */
const formBackgroundColor = "#f8f9fa";
document.documentElement.style.setProperty('--form-bg-color', formBackgroundColor);

// main.js is now a module, ready for future site-wide scripts.