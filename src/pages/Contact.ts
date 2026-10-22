/**
 * Buildora — Interactive Contact Page with Magnetic Straightening Form
 * Inspired by 1minus1.com: oversized display typography, warm paper drafting card,
 * mouse-responsive displacement, and magnetic straightening when cursor enters proximity.
 */

import { triggerWordAnimation, activateContinuousTypography } from '../utils';
import { initContactKineticTypography, initTypographyEngine } from '../typography';

export function renderContactPage(targetEl: HTMLElement): () => void {
  targetEl.innerHTML = `
    <div class="contact-page-container">
      <div class="contact-stage-grid">
        <!-- Left Column: Supporting Statement + Colossal Headline -->
        <div class="contact-narrative-col">
          <div class="contact-eyebrow-block">
            <svg class="bwy-monogram" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="#dfba73" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M10 2V10M10 10L17 6M10 10L3 6" stroke="#f7f3ed" stroke-width="1.1" stroke-linecap="round"/>
              <path d="M10 10V18" stroke="#dfba73" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span class="eyebrow-draft">Spatial Enquiries · Atelier Direct</span>
          </div>

          <p class="contact-manifesto-sub">
            Architectural commissions, residential renovations, and interactive living spaces. Drop Build with Yash a message.
          </p>

          <div class="contact-direct-coords">
            <a href="mailto:iyashjha@gmail.com" class="direct-mail-pill">iyashjha@gmail.com ↗</a>
            <span class="coord-tag">Patna, Bihar</span>
            <span class="coord-tag">Response within 24–48h</span>
          </div>

          <!-- Colossal Architectural Headline (Oversized contour + solid display) -->
          <div class="contact-hero-display" aria-hidden="true">
            <div class="display-line line-contour">
              <svg class="contour-draw-svg" viewBox="0 0 680 120" preserveAspectRatio="xMinYMid meet" aria-hidden="true">
                <text x="0" y="92" class="contour-svg-text">BEGIN YOUR</text>
              </svg>
            </div>
            <div class="display-line line-solid reveal-mask">
              <span class="reveal-inner">SPACE<em>.</em></span>
            </div>
          </div>
        </div>

        <!-- Right Column: Mouse-Responsive Magnetic Settling Form Card -->
        <div class="contact-card-col">
          <div class="contact-magnetic-wrap" id="contact-magnetic-wrap">
            <div class="contact-paper-card" id="contact-paper-card">
              <!-- Card Header -->
              <div class="cpc-header">
                <div class="cpc-mark">
                  <svg viewBox="0 0 24 16" width="22" height="14" fill="none" aria-hidden="true">
                    <rect x="0" y="10" width="6" height="6" fill="#dfba73" />
                    <rect x="9" y="5" width="6" height="11" fill="#dfba73" opacity="0.85" />
                    <rect x="18" y="0" width="6" height="16" fill="#dfba73" opacity="0.65" />
                  </svg>
                  <span class="cpc-heading">GET IN TOUCH</span>
                </div>
                <span class="cpc-status-dot" title="Atelier Open for Commissions">● Available</span>
              </div>

              <p class="cpc-intro">
                Tell us about your site, spatial vision, and project timeline.
              </p>

              <!-- Form State -->
              <form id="spatial-contact-form" class="cpc-form" novalidate>
                <!-- Field: Name -->
                <div class="cpc-field">
                  <label for="cpc-name">NAME <span class="cpc-req">*</span></label>
                  <input type="text" id="cpc-name" name="name" required placeholder="Your Name" autocomplete="name" />
                  <span class="cpc-error-msg" id="err-name" role="alert"></span>
                </div>

                <!-- Field: Email -->
                <div class="cpc-field">
                  <label for="cpc-email">EMAIL <span class="cpc-req">*</span></label>
                  <input type="email" id="cpc-email" name="email" required placeholder="you@example.com" autocomplete="email" />
                  <span class="cpc-error-msg" id="err-email" role="alert"></span>
                </div>

                <!-- Field: Company / Studio (Optional) -->
                <div class="cpc-field">
                  <label for="cpc-company">COMPANY / PRACTICE <span class="cpc-opt">(OPTIONAL)</span></label>
                  <input type="text" id="cpc-company" name="company" placeholder="Studio / Organization" autocomplete="organization" />
                </div>

                <!-- Field: Message -->
                <div class="cpc-field">
                  <label for="cpc-message">PROJECT BRIEF <span class="cpc-req">*</span></label>
                  <textarea id="cpc-message" name="message" rows="4" required placeholder="Describe your residential or spatial renovation, site location, and anticipated timeline..."></textarea>
                  <span class="cpc-error-msg" id="err-message" role="alert"></span>
                </div>

                <!-- Consent Checkbox -->
                <div class="cpc-consent">
                  <label class="cpc-checkbox-label">
                    <input type="checkbox" id="cpc-consent" name="consent" required />
                    <span class="cpc-custom-check"></span>
                    <span class="cpc-consent-text">I agree to have Build with Yash contact me regarding this spatial commission enquiry.</span>
                  </label>
                  <span class="cpc-error-msg" id="err-consent" role="alert"></span>
                </div>

                <!-- Submit Button & State -->
                <div class="cpc-actions">
                  <button type="submit" id="cpc-submit-btn" class="cpc-submit-btn">
                    <span class="btn-text">Send Spatial Brief →</span>
                    <span class="btn-spinner" aria-hidden="true"></span>
                  </button>
                </div>

                <p class="cpc-demo-note">
                  Demonstration submission: validated locally on client. To configure live transmission, wire a Formspree, Resend, or SMTP endpoint.
                </p>
              </form>

              <!-- Validated Brief Handoff View (Honest display when VITE_CONTACT_ENDPOINT is not configured) -->
              <div id="cpc-handoff-view" class="cpc-brief-handoff" style="display:none;" aria-live="polite">
                <div class="cbh-badge">● Validated Locally</div>
                <h3 class="cbh-title">Spatial Brief Ready to Dispatch</h3>
                <p class="cbh-desc">
                  No remote transmission endpoint is configured in this deployment (<code>VITE_CONTACT_ENDPOINT</code>). Your brief has been verified locally. You can send it directly to Yash via email or copy the brief:
                </p>
                <div class="cbh-actions">
                  <a href="#" id="cbh-mailto-btn" class="cpc-submit-btn">Send via Email Client ↗</a>
                  <button type="button" id="cbh-copy-btn" class="cpc-secondary-btn">Copy Formatted Brief</button>
                  <div class="cbh-copy-status" id="cbh-copy-status"></div>
                  <button type="button" id="cbh-edit-btn" class="cbh-back-link">← Edit Brief Details</button>
                </div>
              </div>

              <!-- Success State View (Rendered only upon real endpoint confirmation) -->
              <div id="cpc-success-view" class="cpc-success-view" style="display:none;" aria-live="polite">
                <div class="success-glyph">✓</div>
                <h3>Enquiry Transmitted.</h3>
                <p id="cpc-success-summary">Thank you. Build with Yash has received your spatial brief and will review your project parameters within 24–48 hours.</p>
                <div class="success-actions">
                  <button type="button" id="cpc-reset-btn" class="cpc-secondary-btn">Submit Another Brief</button>
                  <a href="/projects" class="cta" data-link>Explore Selected Works →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const wrapEl = targetEl.querySelector<HTMLElement>('#contact-magnetic-wrap');
  const cardEl = targetEl.querySelector<HTMLElement>('#contact-paper-card');
  const formEl = targetEl.querySelector<HTMLFormElement>('#spatial-contact-form');
  const successViewEl = targetEl.querySelector<HTMLElement>('#cpc-success-view');
  const handoffViewEl = targetEl.querySelector<HTMLElement>('#cpc-handoff-view');
  const submitBtn = targetEl.querySelector<HTMLButtonElement>('#cpc-submit-btn');
  const resetBtn = targetEl.querySelector<HTMLButtonElement>('#cpc-reset-btn');
  const successSummary = targetEl.querySelector<HTMLElement>('#cpc-success-summary');

  // Input elements
  const nameInput = targetEl.querySelector<HTMLInputElement>('#cpc-name');
  const emailInput = targetEl.querySelector<HTMLInputElement>('#cpc-email');
  const companyInput = targetEl.querySelector<HTMLInputElement>('#cpc-company');
  const messageInput = targetEl.querySelector<HTMLTextAreaElement>('#cpc-message');
  const consentInput = targetEl.querySelector<HTMLInputElement>('#cpc-consent');

  // Error elements
  const errName = targetEl.querySelector<HTMLElement>('#err-name');
  const errEmail = targetEl.querySelector<HTMLElement>('#err-email');
  const errMessage = targetEl.querySelector<HTMLElement>('#err-message');
  const errConsent = targetEl.querySelector<HTMLElement>('#err-consent');

  // Trigger kinetic typography animation with 3D subterranean extrusion & SVG stroke drawing
  initContactKineticTypography(targetEl);
  initTypographyEngine(targetEl);

  // -------------------------------------------------------------
  // 1. Authoritative Resting Tilt & Magnetic Straightening Physics
  // -------------------------------------------------------------
  // Canonical resting tilt when pointer is outside proximity zone
  const TILT_ROT = 2.6; // Canonical intended tilt in degrees

  // Dynamic transform values (lerped toward targets)
  let currentX = 0;
  let currentY = 0;
  let currentRot = TILT_ROT;

  // Magnetic proximity threshold around the form's actual bounding box
  const PROXIMITY_THRESHOLD = 260; // pixels surrounding the card

  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let pointerOnScreen = false;
  let isUnmounted = false;
  let rafId: number | null = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  let isPhysicsRunning = false;
  let cachedWrapRect: DOMRect | null = null;

  const ensurePhysicsRunning = () => {
    if (!isPhysicsRunning && !isUnmounted) {
      isPhysicsRunning = true;
      rafId = requestAnimationFrame(updatePhysics);
    }
  };

  const onPointerMove = (e: MouseEvent) => {
    pointerOnScreen = true;
    pointerX = e.clientX;
    pointerY = e.clientY;
    ensurePhysicsRunning();
  };

  const onPointerLeave = () => {
    pointerOnScreen = false;
    ensurePhysicsRunning();
  };

  const onPointerEnter = () => {
    pointerOnScreen = true;
    ensurePhysicsRunning();
  };

  const onResizeOrScroll = () => {
    if (wrapEl) cachedWrapRect = wrapEl.getBoundingClientRect();
    ensurePhysicsRunning();
  };

  const updatePhysics = () => {
    if (isUnmounted || !cardEl || !wrapEl) {
      isPhysicsRunning = false;
      return;
    }

    // On mobile screens, retain clean flat flow layout
    if (window.innerWidth <= 960) {
      cardEl.style.transform = 'none';
      isPhysicsRunning = false;
      return;
    }

    // 1. Measure the form's actual bounding rectangle (cached to eliminate per-frame layout reflow)
    if (!cachedWrapRect) return;
    const wrapRect = cachedWrapRect;

    // 2. Compute shortest Euclidean distance from pointer to the form rectangle
    // If pointer is inside the form rectangle, dx = 0, dy = 0 => distToRect = 0
    const dx = Math.max(wrapRect.left - pointerX, 0, pointerX - wrapRect.right);
    const dy = Math.max(wrapRect.top - pointerY, 0, pointerY - wrapRect.bottom);
    const distToRect = pointerOnScreen ? Math.hypot(dx, dy) : PROXIMITY_THRESHOLD;

    // 3. Proximity factor k (0.0 inside the magnetic zone, smoothly scaling to 1.0 far away)
    let k = 1.0;
    if (!pointerOnScreen) {
      k = 1.0; // Rest in canonical tilt when pointer leaves browser window
    } else if (distToRect >= PROXIMITY_THRESHOLD) {
      k = 1.0; // Fully outside proximity zone -> preserve tilt
    } else if (distToRect > 0) {
      const progress = distToRect / PROXIMITY_THRESHOLD;
      // Smoothstep interpolation for organic magnetic pull
      k = progress * progress * (3 - 2 * progress);
    } else {
      k = 0.0; // Cursor is directly over or inside the form -> straighten
    }

    // 4. Calculate subtle mouse parallax relative to form center
    const formCenterX = wrapRect.left + wrapRect.width * 0.5;
    const formCenterY = wrapRect.top + wrapRect.height * 0.5;
    const relX = pointerX - formCenterX;
    const relY = pointerY - formCenterY;

    const subtleMouseX = pointerOnScreen ? Math.max(-20, Math.min(20, relX * 0.025)) : 0;
    const subtleMouseY = pointerOnScreen ? Math.max(-16, Math.min(16, relY * 0.025)) : 0;
    const subtleMouseRot = pointerOnScreen ? Math.max(-1.8, Math.min(1.8, relX * 0.0025)) : 0;

    // 5. Target pose scaled by proximity k:
    // When k === 0 (inside proximity zone / hovering): targetRot = 0.0, targetX = 0, targetY = 0 (smoothly straightened!)
    // When k === 1 (outside proximity zone): targetRot = TILT_ROT + subtleMouseRot (tilted!)
    const targetX = subtleMouseX * k;
    const targetY = subtleMouseY * k;
    const targetRot = (TILT_ROT + subtleMouseRot) * k;

    // 6. Damped spring interpolation (smooth, crisp straighten & tilt restoration)
    const isSettling = k < 0.5;
    const lerpSpeed = k === 0 ? 0.18 : (isSettling ? 0.14 : 0.09);

    currentX += (targetX - currentX) * lerpSpeed;
    currentY += (targetY - currentY) * lerpSpeed;
    currentRot += (targetRot - currentRot) * lerpSpeed;

    // Snap to exact zero when within micro-tolerance in settle zone to eliminate jitter
    if (k === 0) {
      if (Math.abs(currentX) < 0.02) currentX = 0;
      if (Math.abs(currentY) < 0.02) currentY = 0;
      if (Math.abs(currentRot) < 0.01) currentRot = 0;
    }

    // 7. Rendered transform: Smoothly straightened when hovering, tilted when outside
    cardEl.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px) rotate(${currentRot.toFixed(2)}deg)`;

    // Check if settled to sleep RAF loop (0% idle CPU usage)
    const isSettled =
      Math.abs(currentX - targetX) < 0.03 &&
      Math.abs(currentY - targetY) < 0.03 &&
      Math.abs(currentRot - targetRot) < 0.015;

    if (isSettled) {
      currentX = targetX;
      currentY = targetY;
      currentRot = targetRot;
      cardEl.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px) rotate(${currentRot.toFixed(2)}deg)`;
      isPhysicsRunning = false;
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(updatePhysics);
  };

  if (!prefersReduced && !isTouch && cardEl && wrapEl) {
    cachedWrapRect = wrapEl.getBoundingClientRect();
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResizeOrScroll, { passive: true });
    window.addEventListener('scroll', onResizeOrScroll, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('mouseenter', onPointerEnter);

    ensurePhysicsRunning();
  } else if (cardEl) {
    // Stable canonical resting state on mobile/reduced-motion
    cardEl.style.transform = window.innerWidth <= 960 ? 'none' : `rotate(${TILT_ROT}deg)`;
  }

  // -------------------------------------------------------------
  // 2. Form Validation & Client Submission Handling
  // -------------------------------------------------------------
  const clearErrors = () => {
    if (errName) errName.textContent = '';
    if (errEmail) errEmail.textContent = '';
    if (errMessage) errMessage.textContent = '';
    if (errConsent) errConsent.textContent = '';
    nameInput?.classList.remove('has-error');
    emailInput?.classList.remove('has-error');
    messageInput?.classList.remove('has-error');
    consentInput?.classList.remove('has-error');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  formEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let hasErrors = false;

    const nameVal = nameInput?.value.trim() || '';
    const emailVal = emailInput?.value.trim() || '';
    const messageVal = messageInput?.value.trim() || '';
    const consentVal = consentInput?.checked || false;

    if (!nameVal) {
      if (errName) errName.textContent = 'Please enter your name.';
      nameInput?.classList.add('has-error');
      hasErrors = true;
    }

    if (!emailVal) {
      if (errEmail) errEmail.textContent = 'Please enter your email address.';
      emailInput?.classList.add('has-error');
      hasErrors = true;
    } else if (!validateEmail(emailVal)) {
      if (errEmail) errEmail.textContent = 'Please enter a valid email address.';
      emailInput?.classList.add('has-error');
      hasErrors = true;
    }

    if (!messageVal) {
      if (errMessage) errMessage.textContent = 'Please provide details on your spatial brief.';
      messageInput?.classList.add('has-error');
      hasErrors = true;
    } else if (messageVal.length < 10) {
      if (errMessage) errMessage.textContent = 'Please enter at least 10 characters describing the project.';
      messageInput?.classList.add('has-error');
      hasErrors = true;
    }

    if (!consentVal) {
      if (errConsent) errConsent.textContent = 'Please confirm consent to proceed.';
      consentInput?.classList.add('has-error');
      hasErrors = true;
    }

    if (hasErrors) return;

    const companyVal = companyInput?.value.trim() || '';
    const configuredEndpoint = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim();

    if (configuredEndpoint) {
      // Live transmission over configured endpoint
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }

      fetch(configuredEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          company: companyVal || 'N/A',
          message: messageVal,
          submittedAt: new Date().toISOString(),
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          if (isUnmounted) return;
          if (formEl) formEl.style.display = 'none';
          if (handoffViewEl) handoffViewEl.style.display = 'none';
          if (successViewEl) successViewEl.style.display = 'block';
          if (successSummary) {
            successSummary.textContent = `Thank you, ${nameVal}. Build with Yash has received your spatial brief (${emailVal}) and will review your project parameters within 24–48 hours.`;
          }
        })
        .catch(() => {
          if (isUnmounted) return;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
          }
          if (errConsent) {
            errConsent.textContent = 'Transmission failed. You can email iyashjha@gmail.com directly with your brief.';
          }
        });
    } else {
      // Honest fallback: never simulate transmission when no endpoint is configured.
      // Reveal the verified spatial brief with real mailto dispatch and copy options.
      if (formEl) formEl.style.display = 'none';
      if (successViewEl) successViewEl.style.display = 'none';
      if (handoffViewEl) {
        handoffViewEl.style.display = 'block';

        const briefBody = `NAME: ${nameVal}\nEMAIL: ${emailVal}\nCOMPANY: ${companyVal || 'N/A'}\n\nPROJECT BRIEF:\n${messageVal}\n\n[Verified via Buildora Contact Interface]`;
        const mailtoSubject = encodeURIComponent(`Spatial Commission Brief — ${nameVal}`);
        const mailtoHref = `mailto:iyashjha@gmail.com?subject=${mailtoSubject}&body=${encodeURIComponent(briefBody)}`;

        const mailtoBtn = handoffViewEl.querySelector<HTMLAnchorElement>('#cbh-mailto-btn');
        if (mailtoBtn) mailtoBtn.href = mailtoHref;

        const copyBtn = handoffViewEl.querySelector<HTMLButtonElement>('#cbh-copy-btn');
        const copyStatus = handoffViewEl.querySelector<HTMLElement>('#cbh-copy-status');
        copyBtn?.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(briefBody).then(() => {
              if (copyStatus) copyStatus.textContent = '✓ Brief copied to clipboard!';
              setTimeout(() => {
                if (copyStatus) copyStatus.textContent = '';
              }, 3000);
            }).catch(() => {
              if (copyStatus) copyStatus.textContent = 'Ready to send via email client.';
            });
          }
        });

        const editBtn = handoffViewEl.querySelector<HTMLButtonElement>('#cbh-edit-btn');
        editBtn?.addEventListener('click', () => {
          if (handoffViewEl) handoffViewEl.style.display = 'none';
          if (formEl) formEl.style.display = 'flex';
        });
      }
    }
  });

  resetBtn?.addEventListener('click', () => {
    formEl?.reset();
    clearErrors();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
    if (successViewEl) successViewEl.style.display = 'none';
    if (handoffViewEl) handoffViewEl.style.display = 'none';
    if (formEl) formEl.style.display = 'flex';
  });

  // Return unmount cleanup function
  return () => {
    isUnmounted = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('resize', onResizeOrScroll);
    window.removeEventListener('scroll', onResizeOrScroll);
    document.removeEventListener('mouseleave', onPointerLeave);
    document.removeEventListener('mouseenter', onPointerEnter);
  };
}
