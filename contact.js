/**
 * Matchly - Contact Form Submission & Validation
 * Group 13 - Frontend Engineering
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-container form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = contactForm.querySelector('input[type="text"]');
      const emailInput = contactForm.querySelector('input[type="email"]');
      const messageInput = contactForm.querySelector('textarea');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : 'Valued User';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        if (window.Matchly) window.Matchly.showToast('Please fill in all required fields.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Message';
        contactForm.reset();

        if (window.Matchly) {
          window.Matchly.showToast(`Thank you, ${name}! Your message has been sent to support@matchly.com. We'll reply within 24 hours.`, 'success', 5000);
        }
      }, 900);
    });
  });
})();
