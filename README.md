# Archie P. H. Sinaga — Interactive Developer Portfolio

An interactive, single-page developer portfolio showcasing Archie P. H. Sinaga's achievements, education at Universitas Sriwijaya, work at Alpha Omega Learning Center and PT Sumatera Prima Fibreboard, and machine learning / data analytics projects — each linked to its GitHub repository.

---

## 🌟 Key Features

1. **Rich Design & Atmosphere**:
   - Deep prehistoric navy & glowing amber aesthetic.
   - Parallax hero section with animated explorer mascot and night sky moon.
   - Full dark and light mode toggle with system preference synchronization.
   - Custom illuminated ammonite fossil emblem branding.

2. **Dynamic Data Layer**:
   - All portfolio content is cleanly decoupled into `/data/*.json` files.
   - Dynamic JavaScript rendering engine (`js/render.js`).

3. **Interactive Subsystems**:
   - **Areas of Expertise**: 8 interactive cards triggering detailed capability modals.
   - **Featured Projects**: Carousel with metrics and real code excerpts copied from each project's repository.
   - **Experience Timeline Carousel**: Multi-slide career carousel with keyboard controls, touch swipes, and quantified metrics popups.
   - **Activities & Skills**: Organization leadership history and core technical stack.
   - **Education & Certifications**: Degree, thesis, and certifications grouped by category.
   - **Portfolio 3-Level Filter**: Cumulative (AND) filtering by Type (*Tech / Non-Tech*), Domain (*AI/ML, Data Science, Full-Stack, etc.*), and Topic sub-tags.
   - **Archie AI Assistant (Chatbot)**: Floating assistant whose answers are built from the same `/data` JSON the page renders, so it cannot drift out of sync. Built-in answers are English; an optional Groq API key enables other languages.
   - **Contact Form**: Sends via [Formspree](https://formspree.io) when `contact.formEndpoint` is set in `data/profile.json`; otherwise opens the visitor's email app.
   - **Arcade Mini-Games**: Standalone playable versions of **2048** (`/2048/`) and **Retro Snake** (`/Snake/`).

---

## 📁 Project Structure

```
/
├── index.html               # Main single-page application
├── css/
│   ├── tokens.css           # CSS design tokens (dark/light themes)
│   ├── base.css             # CSS reset, typography, and utility classes
│   ├── components.css       # Buttons, cards, modals, chatbot, and badges
│   └── sections.css         # Responsive section layouts
├── js/
│   ├── main.js              # Application entry point & orchestration
│   ├── theme.js             # Theme toggle & localStorage persistence
│   ├── render.js            # JSON data rendering engine
│   ├── filters.js           # 3-level cumulative project filter system
│   ├── carousel.js          # Experience timeline carousel
│   ├── modal.js             # Accessible modal dialog system
│   ├── chatbot.js           # Floating assistant, answers from /data JSON
│   └── reveal.js            # IntersectionObserver, count-up stats, & spy
├── data/                    # Structured JSON content
│   ├── profile.json
│   ├── expertise.json
│   ├── active-projects.json
│   ├── news.json
│   ├── experience.json
│   ├── skills.json
│   ├── organizations.json
│   ├── education.json
│   ├── certifications.json
│   └── projects.json
├── image/                   # Optimized images and vector assets
├── 2048/                    # 2048 Mini-Game
└── Snake/                   # Snake Mini-Game
```

---

## 🚀 Running Locally

No build step or bundle tooling is required. You can serve the static files with any local HTTP server:

```powershell
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js serve
npx serve -l 8080 .
```

Then open `http://localhost:8080` in your browser.

---

## ✏️ Updating Content

- **Projects**: edit `data/projects.json`. Set `repo` to the GitHub URL (or `null` if there is no public code) and optional `demo`. Buttons are labelled by where they actually go.
- **Featured carousel**: edit `data/active-projects.json`. Keep `code_snippet` copied from the real file named in `code_lang`.
- **Contact form**: create a form at formspree.io and put its endpoint (`https://formspree.io/f/xxxxxxx`) in `data/profile.json` → `contact.formEndpoint`.
