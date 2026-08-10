# Portfolio Professionnel — Estelle Boisserie

Bienvenue sur le dépôt de mon portfolio en ligne ! Ce site a été conçu pour présenter mon parcours d'étudiante ingénieure en cybersécurité (EPITA), mes compétences techniques ainsi que mes projets académiques et professionnels.

🌐 **Voir le site en direct :** [https://portfolio-estelle-bsr.vercel.app/](https://portfolio-estelle-bsr.vercel.app/)

---

## 🛠️ Stack Technique & Architecture

Ce projet repose sur une architecture moderne séparant le frontend statique et le backend serverless :

* **Frontend :** HTML5, CSS3 pur (avec variables dynamiques et variables de thèmes clair/sombre), JavaScript (ES6+).
* **Animations & 3D :** GSAP (ScrollTrigger) pour les animations fluides et Three.js pour la scène 3D interactive du Hero.
* **Internationalisation (i18n) :** Système de traduction dynamique natif (Français / Anglais) géré via `translations.js`.
* **Backend & Sécurité (Vercel Serverless Functions) :** 
  * `/api/contact.js` : Validation hCaptcha et routage des emails via l'API **Brevo**.
  * `/api/chat.js` : Endpoint gérant le terminal interactif de l'intelligence artificielle.
* **Sécurité & Anti-spam :** Protection hCaptcha intégrée sur le formulaire de contact.

---

## 📂 Structure du Projet

```text
├── api/
│   ├── chat.js         # Backend serverless pour le terminal IA
│   └── contact.js      # Backend serverless (validation hCaptcha + API Brevo)
├── assets/             # Images, icônes, polices et CV PDF
├── index.html          # Page principale du portfolio
├── mentions-legales.html # Pages légales et politique de confidentialité (RGPD)
├── package.json        # Configuration des dépendances Node.js / Vercel
├── robots.txt          # Directives pour les moteurs de recherche
├── script.js           # Logique interactive, GSAP et gestion du formulaire
├── style.css           # Styles globaux, responsive design et glassmorphism
└── translations.js     # Dictionnaire des traductions FR/EN
```

---

## 🛡️ Conformité & Sécurité
* **RGPD :** Aucun cookie de tracking publicitaire n'est utilisé. Le traitement des données du formulaire est sécurisé et conforme.
* **Variables d'environnement :** Les clés secrètes (API Brevo, clé secrète hCaptcha, clés API IA) sont gérées de manière sécurisée côté serveur via Vercel et ne sont jamais exposées dans le code source.

---

## 👩‍💻 Contact
* **LinkedIn :** [linkedin.com/in/estelle-boisserie](https://www.linkedin.com/in/estelle-boisserie)
* **Email :** estelleboisserie@orange.fr
