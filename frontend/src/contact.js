import { renderNavigation } from './nav.js';
import { setPageMeta } from './utils.js';
import { submitInquiry, subscribeMailingList, fetchPaintings } from './api.js';

export async function renderContact() {
  setPageMeta(
    'Contact - Vermillion Pavilion',
    'Contact us for inquiries about paintings or subscribe to receive exhibition updates.'
  );

  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">
        <section class="intro-section">
          <h1>Contact</h1>

          <div class="contact-form-toggle">
            <button class="toggle-btn active" data-mode="inquiry">Inquire about a painting</button>
            <button class="toggle-btn" data-mode="subscribe">Join mailing list</button>
          </div>

          <form id="contact-form" class="contact-form">
            <!-- Inquiry mode (default) -->
            <div id="inquiry-fields">
              <div class="form-group">
                <label for="name">Name *</label>
                <input type="text" id="name" name="name" required>
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
              </div>

              <div class="form-group">
                <label for="painting">Catalog number (optional)</label>
                <input type="text" id="painting" name="painting" placeholder="e.g., 0042">
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>
            </div>

            <!-- Subscribe mode (hidden by default) -->
            <div id="subscribe-fields" style="display: none;">
              <div class="form-group">
                <label for="sub-name">Name *</label>
                <input type="text" id="sub-name" name="sub-name" required>
              </div>

              <div class="form-group">
                <label for="sub-email">Email *</label>
                <input type="email" id="sub-email" name="sub-email" required>
              </div>

              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="consent" name="consent" required>
                  I consent to receive occasional emails about new painting exhibitions
                </label>
              </div>

              <p class="privacy-note">
                We will only email you about new exhibitions. You can unsubscribe at any time.
                We will never share your email with third parties.
              </p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">Submit</button>
            </div>

            <div id="form-message" class="form-message"></div>
          </form>
        </section>
      </div>
    </div>
  `;

  // Form mode toggle
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const inquiryFields = document.getElementById('inquiry-fields');
  const subscribeFields = document.getElementById('subscribe-fields');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;

      // Update button states
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle field visibility
      if (mode === 'inquiry') {
        inquiryFields.style.display = 'block';
        subscribeFields.style.display = 'none';
        document.querySelector('#message').required = true;
      } else {
        inquiryFields.style.display = 'none';
        subscribeFields.style.display = 'block';
        document.querySelector('#message').required = false;
      }

      // Clear form message
      document.getElementById('form-message').textContent = '';
    });
  });

  // Form submission
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const messageEl = document.getElementById('form-message');
  const activeMode = document.querySelector('.toggle-btn.active').dataset.mode;

  try {
    if (activeMode === 'inquiry') {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      const catalogNumber = document.getElementById('painting').value.trim() || null;

      await submitInquiry(name, email, message, catalogNumber);

      messageEl.className = 'form-message success';
      messageEl.textContent = 'Thank you for your inquiry! We will respond within 48 hours.';

    } else {
      const name = document.getElementById('sub-name').value;
      const email = document.getElementById('sub-email').value;

      await subscribeMailingList(name, email);

      messageEl.className = 'form-message success';
      messageEl.textContent = 'Thank you for subscribing! You will receive updates about new exhibitions.';
    }

    // Reset form
    e.target.reset();

  } catch (err) {
    messageEl.className = 'form-message error';
    messageEl.textContent = 'Failed to submit. Please try again or email us directly at contact@vermillionpavilion.com';
  }
}
