# Archie P. H. Sinaga — Interactive Developer Portfolio

An interactive, single-page developer portfolio showcasing Archie P. H. Sinaga's achievements, education at Universitas Sriwijaya, work at Gonsters and ALC, and machine learning/data analytics projects.

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
   - **Active Projects & Code Sandbox**: Live project status, architecture code panels, and metrics.
   - **Experience Timeline Carousel**: Multi-slide career carousel with keyboard controls, touch swipes, and quantified metrics popups.
   - **Activities & Skills**: Organization leadership history, categorized technical stack grid, education, and verified credentials.
   - **Portfolio 3-Level Filter**: Cumulative (AND) filtering by Type (*Tech / Non-Tech*), Domain (*AI/ML, Data Science, Full-Stack, etc.*), and Topic sub-tags.
   - **Archie AI Assistant (Chatbot)**: Floating portfolio assistant with multilingual support (EN, ID, ZH, AR, JA), quick chips, local knowledge base, and custom Groq/OpenAI/Gemini API key support.
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
│   ├── chatbot.js           # Floating AI assistant chatbot
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
