/* ===========================================================
   FIDUCIAIRE DU GOLFE — Scripts d'interaction
   - Header sticky
   - Menu mobile
   - Animations au scroll (IntersectionObserver)
   - Année dynamique
   - Gestion formulaire (front)
   - Hook Google Reviews (placeholder, à activer plus tard)
   =========================================================== */

(function () {
  'use strict';

  // -------- Année dynamique footer --------
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------- Header sticky / scrolled --------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------- Toggle menu mobile --------
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('mobile-open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('mobile-open');
        toggle.classList.remove('open');
      });
    });
  }

  // -------- Reveal au scroll --------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // -------- Formulaire de contact (front-only) --------
  const form = document.querySelector('.contact-form');
  if (form) {
    const success = form.querySelector('.form-success');
    const errorBox = form.querySelector('.form-error');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      success?.classList.remove('show');
      errorBox?.classList.remove('show');

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const consent = form.querySelector('[name="consent"]')?.checked;

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message || !consent) {
        if (errorBox) {
          errorBox.textContent = "Merci de renseigner tous les champs requis et d'accepter le traitement des données.";
          errorBox.classList.add('show');
        }
        return;
      }

      // Endpoint d'envoi : à connecter plus tard (PHP, Formspree, EmailJS, etc.)
      // Exemple : fetch('/api/contact', { method: 'POST', body: data })
      if (success) {
        success.textContent = "Merci, votre demande a bien été reçue. Nous vous recontactons sous 24h ouvrées.";
        success.classList.add('show');
      }
      form.reset();
    });
  }

  // -------- Google Reviews (placeholder) ---------------------
  // Activation : appeler initGoogleReviews({ placeId, apiKey }) plus tard.
  // Recommandation : passer par un proxy serveur (Cloud Function / PHP) pour
  // ne pas exposer la clé API. L'API "Place Details" renvoie 5 avis maximum ;
  // pour davantage, utiliser un agrégateur tiers (Trustindex, Elfsight, etc.)
  // ou stocker côté serveur.
  window.initGoogleReviews = async function ({ placeId, endpoint } = {}) {
    const container = document.querySelector('[data-google-reviews]');
    if (!container) return;
    if (!endpoint) return; // pas encore configuré
    try {
      const res = await fetch(`${endpoint}?placeId=${encodeURIComponent(placeId)}`);
      if (!res.ok) throw new Error('reviews fetch failed');
      const json = await res.json();
      renderReviews(container, json);
    } catch (err) {
      console.warn('Google Reviews indisponibles :', err);
    }
  };

  function renderReviews(container, payload) {
    const reviews = payload?.reviews || [];
    if (!reviews.length) return;
    container.innerHTML = reviews.slice(0, 3).map(r => {
      const initial = (r.author_name || '?').trim().charAt(0).toUpperCase();
      const stars = '★'.repeat(Math.round(r.rating || 5)) + '☆'.repeat(5 - Math.round(r.rating || 5));
      const date = r.relative_time_description || '';
      return `
        <article class="review-card reveal in">
          <div class="review-stars" aria-label="${r.rating} étoiles sur 5">${stars}</div>
          <p class="review-text">"${escapeHtml(r.text || '')}"</p>
          <div class="review-author">
            <div class="review-avatar">${initial}</div>
            <div class="review-author-info">
              <div class="name">${escapeHtml(r.author_name || '')}</div>
              <div class="meta">${escapeHtml(date)}</div>
            </div>
          </div>
        </article>`;
    }).join('');
    const ratingEl = document.querySelector('[data-google-rating]');
    if (ratingEl && payload.rating) ratingEl.textContent = payload.rating.toFixed(1);
    const countEl = document.querySelector('[data-google-count]');
    if (countEl && payload.user_ratings_total) countEl.textContent = payload.user_ratings_total;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // -------- Lien actif basé sur l'URL ----------------------
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const norm = href.replace(/\/$/, '') || '/';
    if (norm === path || (path === '/' && norm.endsWith('index.html'))) {
      a.classList.add('active');
    }
  });
})();
