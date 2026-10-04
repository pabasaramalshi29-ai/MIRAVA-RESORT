/* ==========================================================================
   MIRAVA RESORT — script.js
   All interactivity written in Vanilla JavaScript (no frameworks)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----------------------------------------------------------------------
     1. MOBILE HAMBURGER MENU
     Toggles the slide-in navigation panel on small screens.
  ---------------------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close the mobile menu whenever a link inside it is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ----------------------------------------------------------------------
     2 & 3. STICKY NAVBAR + BACKGROUND CHANGE ON SCROLL
     The header is transparent over the hero, then turns solid deep green
     and shrinks slightly once the user scrolls past ~60px.
  ---------------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  function handleScroll() {
    header.classList.toggle('scrolled', window.scrollY > 60);
    backToTop.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // run once on page load

  /* ----------------------------------------------------------------------
     4. SMOOTH SCROLLING
     Native CSS smooth-scroll handles anchors; JS adds support for older
     browsers and closes any open overlays before navigating.
  ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------------------
     5. ACTIVE NAVIGATION LINK HIGHLIGHT
     Uses IntersectionObserver to mark the nav link of the section
     currently in view.
  ---------------------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => navObserver.observe(section));

  /* ----------------------------------------------------------------------
     HELPER — form message display
  ---------------------------------------------------------------------- */
  function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'form-message ' + type;
  }

  // Simple email pattern used by several forms
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ----------------------------------------------------------------------
     6, 7, 8, 9. BOOKING SEARCH FORM VALIDATION
     Validates dates (check-out must be after check-in), guest numbers,
     room type, then shows a success message.
  ---------------------------------------------------------------------- */
  const bookingForm = document.getElementById('bookingForm');
  const bookingMessage = document.getElementById('bookingMessage');

  // Prevent choosing a check-in date in the past
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkIn').min = today;
  document.getElementById('checkOut').min = today;

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    const checkIn  = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const adults   = parseInt(document.getElementById('adults').value, 10);
    const children = parseInt(document.getElementById('children').value, 10);
    const roomType = document.getElementById('roomType').value;

    // Required fields
    if (!checkIn || !checkOut || !roomType) {
      showMessage(bookingMessage, 'Please fill in all booking details.', 'error');
      return;
    }
    // Date logic: check-out must be AFTER check-in
    if (new Date(checkOut) <= new Date(checkIn)) {
      showMessage(bookingMessage, 'Check-out date must be after the check-in date.', 'error');
      return;
    }
    // Guest number validation
    if (isNaN(adults) || adults < 1 || adults > 6) {
      showMessage(bookingMessage, 'Adults must be between 1 and 6.', 'error');
      return;
    }
    if (isNaN(children) || children < 0 || children > 6) {
      showMessage(bookingMessage, 'Children must be between 0 and 6.', 'error');
      return;
    }

    // Success
    showMessage(
      bookingMessage,
      `Great news! ${roomType}s are available from ${checkIn} to ${checkOut} for ${adults + children} guest(s). Proceed to "Book Now" to confirm.`,
      'success'
    );
    bookingForm.reset();
  });

  /* ----------------------------------------------------------------------
     10. CONTACT FORM VALIDATION
  ---------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const contactMessage = document.getElementById('contactMessage');

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('cName').value.trim();
    const email   = document.getElementById('cEmail').value.trim();
    const phone   = document.getElementById('cPhone').value.trim();
    const subject = document.getElementById('cSubject').value.trim();
    const message = document.getElementById('cMessage').value.trim();

    if (!name || !email || !phone || !subject || !message) {
      showMessage(contactMessage, 'Please complete all fields before sending.', 'error');
      return;
    }
    if (!emailPattern.test(email)) {
      showMessage(contactMessage, 'Please enter a valid email address.', 'error');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      showMessage(contactMessage, 'Please enter a valid phone number.', 'error');
      return;
    }

    // Data is NOT sent to a server — just a friendly confirmation.
    showMessage(contactMessage, 'Thank you! Your message has been sent successfully.', 'success');
    contactForm.reset();
  });

  /* ----------------------------------------------------------------------
     11. NEWSLETTER VALIDATION
  ---------------------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMessage = document.getElementById('newsletterMessage');

  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();

    if (!emailPattern.test(email)) {
      showMessage(newsletterMessage, 'Please enter a valid email address.', 'error');
      return;
    }
    showMessage(newsletterMessage, 'Welcome to Mirava! You have been subscribed successfully.', 'success');
    newsletterForm.reset();
  });

  /* ----------------------------------------------------------------------
     12, 13, 14. GALLERY LIGHTBOX
     Click any gallery image to open a fullscreen viewer with
     previous / next controls and an image counter (e.g. "3 / 11").
  ---------------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  let currentImage = 0;

  function openLightbox(index) {
    currentImage = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // stop background scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const img = galleryItems[currentImage];
    // Brief fade for a smooth transition between images
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.opacity = 1;
    }, 150);
    lightboxCounter.textContent = (currentImage + 1) + ' / ' + galleryItems.length;
  }

  function nextImage() { currentImage = (currentImage + 1) % galleryItems.length; updateLightbox(); }
  function prevImage() { currentImage = (currentImage - 1 + galleryItems.length) % galleryItems.length; updateLightbox(); }

  galleryItems.forEach((img, index) => img.addEventListener('click', () => openLightbox(index)));
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextImage);
  lightboxPrev.addEventListener('click', prevImage);

  // Keyboard support: Esc closes, arrows navigate
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  /* ----------------------------------------------------------------------
     15. TESTIMONIAL SLIDER / CAROUSEL
     Slides one review at a time with prev / next buttons and dots.
  ---------------------------------------------------------------------- */
  const track  = document.getElementById('sliderTrack');
  const slides = track.children.length;
  const dotsWrap = document.getElementById('sliderDots');
  let slideIndex = 0;
  let autoSlide;

  // Build one dot per slide
  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap.querySelectorAll('.dot');

  function goToSlide(i) {
    slideIndex = (i + slides) % slides;
    // 24px margin-right per card is accounted for in the offset
    track.style.transform = `translateX(calc(${-slideIndex * 100}% - ${slideIndex * 24}px))`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === slideIndex));
    restartAutoSlide();
  }

  document.getElementById('nextSlide').addEventListener('click', () => goToSlide(slideIndex + 1));
  document.getElementById('prevSlide').addEventListener('click', () => goToSlide(slideIndex - 1));

  // Auto-advance every 6 seconds; pause on hover
  function restartAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goToSlide(slideIndex + 1), 6000);
  }
  restartAutoSlide();
  track.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.addEventListener('mouseleave', restartAutoSlide);

  /* ----------------------------------------------------------------------
     16. SCROLL REVEAL ANIMATIONS
     Adds the .visible class as sections enter the viewport.
  ---------------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------------------
     17. ANIMATED STATISTICS COUNTERS
     Counts up from 0 to the data-target value when the About
     section becomes visible.
  ---------------------------------------------------------------------- */
  const counters = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(counter => {
          const target = +counter.dataset.target;
          const duration = 1800;               // total animation time (ms)
          const stepTime = Math.max(Math.floor(duration / target), 30);
          let value = 0;
          const timer = setInterval(() => {
            value += 1;
            counter.textContent = value;
            if (value >= target) clearInterval(timer);
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.4 });

  const statsBlock = document.querySelector('.stats');
  if (statsBlock) counterObserver.observe(statsBlock);

  /* ----------------------------------------------------------------------
     18. BACK-TO-TOP BUTTON
     (visibility toggled inside handleScroll above)
  ---------------------------------------------------------------------- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------------------
     19. ROOM BOOKING MODAL
     Opens when any "Book Now" button is clicked, with the matching
     room type pre-selected. Includes full validation.
  ---------------------------------------------------------------------- */
  const bookingModal  = document.getElementById('bookingModal');
  const modalClose    = document.getElementById('modalClose');
  const modalForm     = document.getElementById('modalBookingForm');
  const modalMessage  = document.getElementById('modalMessage');
  const mCheckIn      = document.getElementById('mCheckIn');
  const mCheckOut     = document.getElementById('mCheckOut');
  const mRoomType     = document.getElementById('mRoomType');

  mCheckIn.min = today;
  mCheckOut.min = today;

  function openModal(roomName) {
    if (roomName) mRoomType.value = roomName;
    modalMessage.className = 'form-message';
    modalMessage.textContent = '';
    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // "Book Now" buttons on the room cards
  document.querySelectorAll('.book-room-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.room));
  });

  // "Book Offer" buttons also open the modal
  document.querySelectorAll('.offer-book-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal());
  });

  modalClose.addEventListener('click', closeModal);
  bookingModal.querySelector('[data-close-modal]').addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bookingModal.classList.contains('open')) closeModal();
  });

  // Modal form validation
  modalForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('mName').value.trim();
    const email   = document.getElementById('mEmail').value.trim();
    const guests  = parseInt(document.getElementById('mGuests').value, 10);
    const inDate  = mCheckIn.value;
    const outDate = mCheckOut.value;

    if (!name || !email || !inDate || !outDate || !mRoomType.value) {
      showMessage(modalMessage, 'Please fill in all fields.', 'error');
      return;
    }
    if (!emailPattern.test(email)) {
      showMessage(modalMessage, 'Please enter a valid email address.', 'error');
      return;
    }
    if (new Date(outDate) <= new Date(inDate)) {
      showMessage(modalMessage, 'Check-out date must be after the check-in date.', 'error');
      return;
    }
    if (isNaN(guests) || guests < 1 || guests > 10) {
      showMessage(modalMessage, 'Number of guests must be between 1 and 10.', 'error');
      return;
    }

    showMessage(
      modalMessage,
      'Your booking request has been received! We look forward to welcoming you to MIRAVA RESORT.',
      'success'
    );
    modalForm.reset();

    // Close the modal automatically after a short success display
    setTimeout(closeModal, 3200);
  });

  /* ----------------------------------------------------------------------
     20. CURRENT YEAR IN FOOTER (automatic)
  ---------------------------------------------------------------------- */
  document.getElementById('currentYear').textContent = new Date().getFullYear();
});
