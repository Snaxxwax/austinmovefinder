/**
 * Fallback Quote Form Handler for Austin Move Finder
 * This is a simplified version for backward compatibility
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Fallback quote.js loaded");

  // Check if enhanced handlers are already loaded
  if (window.quoteFormHandler || window.formEnhancements) {
    console.log("Enhanced form handlers detected, skipping fallback");
    return;
  }

  console.log("Initializing fallback quote form handler");

  // Basic form functionality as fallback
  const form = document.getElementById("quote-form");
  const messageBox = document.getElementById("message-box");

  if (!form) {
    console.error("Quote form not found");
    return;
  }

  // Simple form submission handler
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = "#dc3545";
      } else {
        field.style.borderColor = "";
      }
    });

    if (!isValid) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    try {
      const formData = new FormData(form);

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showMessage(
          "Thank you! Your quote request has been submitted successfully. You will receive quotes within 2 hours.",
          "success",
        );
        form.style.display = "none";
      } else {
        showMessage(
          result.error ||
            "There was an error submitting your request. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      showMessage(
        "Network error. Please check your connection and try again.",
        "error",
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Get My Quotes";
      }
    }
  });

  function showMessage(message, type) {
    if (messageBox) {
      messageBox.textContent = message;
      messageBox.className = `message-box ${type} show`;

      setTimeout(() => {
        messageBox.classList.remove("show");
      }, 5000);
    } else {
      alert(message);
    }
  }

  console.log("Fallback quote form handler initialized");
});
