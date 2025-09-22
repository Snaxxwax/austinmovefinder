document.addEventListener('DOMContentLoaded', () => {
    const quoteForm = document.getElementById('quote-form');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            // In a real application, you would send this data to a server.
            // For this example, we'll just log it and redirect.
            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Submitted:', data);

            // Redirect to the thank you page
            window.location.href = '/Thankyou.html';
        });
    }
});