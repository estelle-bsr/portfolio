/**
 * @fileoverview Main JavaScript file for Estelle Boisserie's Portfolio.
 * Handles translations, GSAP animations, 3D rendering, and UI interactions.
 */

const SCROLL_THRESHOLD = 40;
const TYPEWRITER_SPEED_MS = 55;
const TYPEWRITER_PAUSE_MS = 1800;
const ANIMATION_DURATION = 0.8;
const MODAL_FADEOUT_MS = 400;
const FORM_STATUS_TIMEOUT_MS = 5000;
const FORM_SIMULATION_DELAY_MS = 1000;
const TILT_PERSPECTIVE = 800;
const SUPPORTED_LANGUAGES = ["fr", "en"];

let _typewriterPhrases = [];
let _typewriterIndex = 0;
let _typewriterChar = 0;
let _typewriterDeleting = false;
let _typewriterTimer = null;
let _typewriterEl = null;

/**
 * Resolves a dot-separated key path against the translation dictionary.
 * @param {string} lang - ISO 639-1 language code.
 * @param {string} key - Dot-separated key path (e.g., 'hero.title').
 * @returns {string|null} The resolved translation text or null if not found.
 */
function resolveKey(lang, key) {
  const parts = key.split(".");
  let node = translations[lang];
  for (const part of parts) {
    if (!node || !(part in node)) return null;
    node = node[part];
  }
  return node;
}

/**
 * Applies translation text to a specific DOM element based on data attributes.
 * @param {HTMLElement} el - The target DOM element.
 * @param {string} lang - The target language code.
 * @returns {void}
 */
function applyTranslation(el, lang) {
  const key = el.dataset.i18n;
  const htmlKey = el.dataset.i18nHtml;
  const altKey = el.dataset.i18nAlt;
  const placeholderKey = el.dataset.i18nPlaceholder;
  const ariaKey = el.dataset.i18nAriaLabel;

  if (key) {
    const value = resolveKey(lang, key);
    if (typeof value === "string") el.textContent = value;
  }
  if (htmlKey) {
    const value = resolveKey(lang, htmlKey);
    if (typeof value === "string") el.innerHTML = value;
  }
  if (altKey) {
    const value = resolveKey(lang, altKey);
    if (typeof value === "string") el.setAttribute("alt", value);
  }
  if (placeholderKey) {
    const value = resolveKey(lang, placeholderKey);
    if (typeof value === "string") el.setAttribute("placeholder", value);
  }
  if (ariaKey) {
    const value = resolveKey(lang, ariaKey);
    if (typeof value === "string") el.setAttribute("aria-label", value);
  }
}

/**
 * Updates the entire UI to match the selected language.
 * @param {string} lang - The target language code ('fr' or 'en').
 * @returns {void}
 */
function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  document.documentElement.setAttribute("lang", lang);

  document.querySelectorAll("[data-i18n], [data-i18n-html], [data-i18n-alt], [data-i18n-placeholder], [data-i18n-aria-label]")
    .forEach((el) => applyTranslation(el, lang));

  document.querySelectorAll(".lang-option").forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  if (translations[lang] && translations[lang].hero) {
    updateTypewriterPhrases(translations[lang].hero.typewriter);
  }
  
  if (typeof splitIntoWords === "function") {
      document.querySelectorAll(".hero-title, .section-title").forEach(splitIntoWords);
  }
}

/**
 * Binds click events to language switcher buttons.
 * @returns {void}
 */
function initLanguageSwitcher() {
  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
}

/**
 * Manages the visual state of the navigation bar during page scrolling.
 * @param {HTMLElement} navbar - The navigation bar DOM element.
 * @returns {void}
 */
function initNavbarScroll(navbar) {
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
  });
}

/**
 * Binds click events to the theme toggle button (Dark/Light mode).
 * @param {HTMLElement} button - The theme toggle button element.
 * @returns {void}
 */
function initThemeToggle(button) {
  if (!button) return;
  button.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    document.documentElement.setAttribute("data-theme", isLight ? "dark" : "light");
  });
}

/**
 * Replaces the array of phrases for the typewriter and restarts the animation.
 * @param {Array<string>} phrases - An array of string phrases.
 * @returns {void}
 */
function updateTypewriterPhrases(phrases) {
  clearTimeout(_typewriterTimer);
  _typewriterPhrases = phrases;
  _typewriterIndex = 0;
  _typewriterChar = 0;
  _typewriterDeleting = false;
  if (_typewriterEl) _typewriterEl.textContent = "";
  runTypewriter();
}

/**
 * Executes a single frame loop of the typewriter text animation.
 * @returns {void}
 */
function runTypewriter() {
  if (!_typewriterEl || _typewriterPhrases.length === 0) return;
  const current = _typewriterPhrases[_typewriterIndex];
  
  if (!_typewriterDeleting) {
    _typewriterChar++;
    _typewriterEl.textContent = current.slice(0, _typewriterChar);
    if (_typewriterChar === current.length) {
      _typewriterDeleting = true;
      _typewriterTimer = setTimeout(runTypewriter, TYPEWRITER_PAUSE_MS);
      return;
    }
  } else {
    _typewriterChar--;
    _typewriterEl.textContent = current.slice(0, _typewriterChar);
    if (_typewriterChar === 0) {
      _typewriterDeleting = false;
      _typewriterIndex = (_typewriterIndex + 1) % _typewriterPhrases.length;
    }
  }
  _typewriterTimer = setTimeout(runTypewriter, _typewriterDeleting ? 30 : TYPEWRITER_SPEED_MS);
}

/**
 * Bootstraps the typewriter animation on a specific DOM element.
 * @param {HTMLElement} el - Target DOM element for the text output.
 * @returns {void}
 */
function initTypewriter(el) {
  if (!el || !translations.fr || !translations.fr.hero) return;
  _typewriterEl = el;
  updateTypewriterPhrases(translations.fr.hero.typewriter);
}

/**
 * Initializes the timeline filter buttons to show/hide experience items dynamically.
 * Refreshes ScrollTrigger to recalculate page layout heights.
 * @returns {void}
 */
function initTimelineFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".timeline-item");

  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      const filterValue = btn.dataset.filter;

      items.forEach((item) => {
        if (filterValue === "all" || item.dataset.category === filterValue) {
          item.style.display = "";
          if (typeof gsap !== "undefined") {
            gsap.fromTo(item, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
          }
        } else {
          item.style.display = "none";
        }
      });
      
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });
}

/**
 * Initializes 'Read More' buttons for long experience descriptions.
 * @returns {void}
 */
function initReadMore() {
  const buttons = document.querySelectorAll(".btn-read-more");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const textElement = btn.previousElementSibling;
      const isExpanded = textElement.classList.contains("is-expanded");
      const lang = document.documentElement.getAttribute("lang") || "fr";
      
      if (isExpanded) {
        textElement.classList.remove("is-expanded");
        btn.textContent = translations[lang].experience.readMore;
      } else {
        textElement.classList.add("is-expanded");
        btn.textContent = translations[lang].experience.readLess;
      }
      
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });
}

/**
 * Initializes the photo modal (pop-up) for viewing experience images.
 * @returns {void}
 */
function initPhotoModal() {
  const modal = document.getElementById("photo-modal");
  const modalImg = document.getElementById("modal-image");
  const openBtns = document.querySelectorAll(".js-open-modal");
  const closeBtns = document.querySelectorAll("[data-close-modal]");

  if (!modal || !modalImg) return;

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const imgSrc = btn.getAttribute("data-img");
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => { modalImg.src = ""; }, MODAL_FADEOUT_MS); 
  };

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

/**
 * Handles the contact form submission via AJAX to prevent page reload.
 * @returns {void}
 */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  if (!form || !statusEl) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitSpan = form.querySelector(".form-submit span");
    const originalText = submitSpan ? submitSpan.textContent : "";
    const lang = document.documentElement.getAttribute("lang") || "fr";
    const t = translations[lang] ? translations[lang].contact : null;

    if (submitSpan && t) submitSpan.textContent = t.formSending;

    const actionUrl = form.getAttribute("action");

    try {
      if (!actionUrl || actionUrl.includes("VOTRE_ID_FORMSPREE")) {
        await new Promise(resolve => setTimeout(resolve, FORM_SIMULATION_DELAY_MS));
      } else {
        const formData = new FormData(form);
        const response = await fetch(actionUrl, {
          method: "POST",
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error("Network error");
      }

      if (t) statusEl.textContent = t.formSuccess;
      form.reset();
    } catch (error) {
      statusEl.textContent = lang === "fr" ? "Erreur lors de l'envoi du message." : "Error sending message.";
    } finally {
      if (submitSpan) submitSpan.textContent = originalText;
      setTimeout(() => { statusEl.textContent = ""; }, FORM_STATUS_TIMEOUT_MS);
    }
  });
}

/**
 * Initializes and manages the WebGL 3D abstract object using Three.js.
 * @param {string} containerId - The ID of the HTML container for the canvas.
 * @returns {void}
 */
function init3DHeroScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.6, 1);
  const material = new THREE.MeshBasicMaterial({ 
      color: 0xd1345b, 
      wireframe: true,
      transparent: true,
      opacity: 0.85
  });
  
  const shape = new THREE.Mesh(geometry, material);
  scene.add(shape);
  camera.position.z = 4;

  let targetRotationX = 0;
  let targetRotationY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onDocumentMouseMove(event) {
      targetRotationY = (event.clientX - windowHalfX) * 0.001;
      targetRotationX = (event.clientY - windowHalfY) * 0.001;
  }
  document.addEventListener('mousemove', onDocumentMouseMove);

  function animate() {
      requestAnimationFrame(animate);
      shape.rotation.x += 0.002;
      shape.rotation.y += 0.002;
      shape.rotation.x += (targetRotationX - shape.rotation.x) * 0.05;
      shape.rotation.y += (targetRotationY - shape.rotation.y) * 0.05;
      renderer.render(scene, camera);
  }
  animate();

  function onWindowResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onWindowResize);
}

/**
 * Splits the text content of a DOM element into isolated word spans for GSAP curtain animations.
 * @param {HTMLElement} el - The DOM element containing the text to split.
 * @returns {void}
 */
function splitIntoWords(el) {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((token) => {
        if (token.trim() === "") {
          el.appendChild(document.createTextNode(token));
        } else {
          const wrap = document.createElement("span");
          const inner = document.createElement("span");
          wrap.className = "reveal-word";
          inner.className = "reveal-word-inner";
          inner.textContent = token;
          wrap.appendChild(inner);
          el.appendChild(wrap);
        }
      });
    } else {
      const wrap = document.createElement("span");
      const inner = document.createElement("span");
      wrap.className = "reveal-word";
      inner.className = "reveal-word-inner";
      inner.appendChild(node.cloneNode(true));
      wrap.appendChild(inner);
      el.appendChild(wrap);
    }
  });
}

/**
 * Initialises GSAP animations to reveal header words dynamically on scroll.
 * @returns {void}
 */
function initSplitText() {
  document.querySelectorAll(".hero-title, .section-title").forEach(splitIntoWords);
  document.querySelectorAll(".section-title").forEach((title) => {
    gsap.from(title.querySelectorAll(".reveal-word-inner"), {
        yPercent: 110,
        opacity: 0,
        duration: ANIMATION_DURATION,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: { trigger: title, start: "top 85%" }
    });
  });
}

/**
 * Triggers the hero section entrance animations.
 * @returns {void}
 */
function animateHeroEntrance() {
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero .eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.1)
    .from(".hero-title .reveal-word-inner", { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.025 }, 0.25)
    .from(".hero-desc", { opacity: 0, y: 20, duration: 0.8 }, 0.4)
    .from(".hero-sub", { opacity: 0, y: 20, duration: 0.8 }, 0.5)
    .from(".hero-actions", { opacity: 0, y: 20, duration: 0.8 }, 0.65)
    .from(".hero-stats", { opacity: 0, y: 20, duration: 0.8 }, 0.8)
    .from(".character-stage", { opacity: 0, scale: 0.85, y: 40, duration: 1.1 }, 0.3)
    .from(".float-badge", { opacity: 0, y: 20, scale: 0.9, duration: 0.6, stagger: 0.12 }, 0.9);
}

/**
 * Generates upward fade animations for generic elements triggering on scroll.
 * @returns {void}
 */
function initScrollReveals() {
  const targets = [
    { selector: ".about .section-head", y: 30 },
    { selector: ".about-photo", y: 24 },
    { selector: ".about-text", y: 24 },
    { selector: ".info-card", y: 30, stagger: 0.15 },
    { selector: ".extra-block", y: 24, stagger: 0.15 },
    { selector: ".skills .section-head", y: 30 },
    { selector: ".skill-card", y: 30, stagger: 0.08 },
    { selector: ".skills-row", y: 24, stagger: 0.12 },
    { selector: ".projects .section-head", y: 30 },
    { selector: ".experience .section-head", y: 30 },
    { selector: ".engagement-card", y: 24, stagger: 0.12 },
    { selector: ".contact .section-head", y: 30 },
    { selector: ".contact-form", y: 30 },
  ];
  targets.forEach(({ selector, y, stagger }) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
        opacity: 0, 
        y: y,
        duration: ANIMATION_DURATION, 
        ease: "power3.out",
        stagger: stagger || 0,
        scrollTrigger: { trigger: els[0].closest("section") || els[0], start: "top 82%" }
    });
  });
}

/**
 * Triggers rotating entrance animations for project cards on scroll.
 * @returns {void}
 */
function initProjectCardEntrance() {
  gsap.from(".project-card", {
      opacity: 0, y: 50, scale: 0.92,
      duration: ANIMATION_DURATION, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".projects-grid", start: "top 82%" }
  });
}

/**
 * Alternates slide-in directions for timeline elements on scroll.
 * @returns {void}
 */
function initTimelineEntrance() {
  document.querySelectorAll(".timeline-item").forEach((item, i) => {
    gsap.from(item, {
        opacity: 0, x: i % 2 === 0 ? -40 : 40,
        duration: ANIMATION_DURATION, ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 85%" }
    });
  });
}

/**
 * Dynamically counts up numbers within elements containing a specific data attribute.
 * @returns {void}
 */
function initStatCounters() {
  document.querySelectorAll(".stat-num").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    gsap.fromTo(el, 
      { textContent: 0 }, 
      {
        textContent: target,
        duration: 1.6, delay: 1, ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate() { el.textContent = Math.floor(Number(el.textContent)); }
      }
    );
  });
}

/**
 * Injects four span elements into specified cards to create a dashed corner hover effect.
 * @returns {void}
 */
function initCornerFrames() {
  const selector = ".project-card, .skill-card, .info-card, .timeline-card, .engagement-card, .skills-row";
  document.querySelectorAll(selector).forEach((card) => {
    card.classList.add("has-corners");
    ["tl", "tr", "bl", "br"].forEach((pos) => {
      const span = document.createElement("span");
      span.className = `corner corner-${pos}`;
      card.appendChild(span);
    });
  });
}

/**
 * Assigns a 3D tilt transformation to cards responding to mouse movement.
 * @param {boolean} isTouch - Flag determining if user interacts via a touch device.
 * @returns {void}
 */
function initCardTilt(isTouch) {
  if (isTouch) return;
  const selector = ".skill-card, .info-card, .timeline-card, .engagement-card";
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: relX * 8, rotateX: -relY * 8,
        duration: 0.5, ease: "power2.out",
        transformPerspective: TILT_PERSPECTIVE,
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
    });
  });
}

/**
 * Applies a slight magnetic effect to buttons causing them to follow the cursor.
 * @param {boolean} isTouch - Flag determining if user interacts via a touch device.
 * @returns {void}
 */
function initMagneticButtons(isTouch) {
  if (isTouch) return;
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - rect.left - rect.width / 2) * 0.3,
        y: (e.clientY - rect.top - rect.height / 2) * 0.4,
        duration: 0.4, ease: "power2.out",
      });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  const isTouch = window.matchMedia("(hover: none)").matches;
  const navbar = document.getElementById("navbar");
  const themeBtn = document.getElementById("theme-toggle");
  const typewriterEl = document.getElementById("typewriter");

  initLanguageSwitcher();
  initNavbarScroll(navbar);
  initThemeToggle(themeBtn);
  initTypewriter(typewriterEl);
  init3DHeroScene("hero-3d-canvas");

  setLanguage("fr");

  setTimeout(() => {
    if (typeof gsap !== "undefined") {
        initSplitText();
        animateHeroEntrance();
        initScrollReveals();
        initProjectCardEntrance();
        initTimelineEntrance();
        initStatCounters();
    }
  }, 50);

  initCornerFrames();
  initCardTilt(isTouch);
  initMagneticButtons(isTouch);
  
  initTimelineFilter();
  initReadMore();
  initPhotoModal();
  initContactForm();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
