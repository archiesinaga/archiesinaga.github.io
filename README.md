# Archie P. H. Sinaga — Interactive Developer Portfolio

An interactive, single-page developer portfolio showcasing Archie P. H. Sinaga's achievements, education at Universitas Sriwijaya, work at Alpha Omega Learning Center and PT Sumatera Prima Fibreboard, and machine learning / data analytics projects — each linked to its GitHub repository.

---

## 🌟 Key Features

1. **Clean, readable design**:
   - White monochrome theme by default, with a dark mode toggle.
   - Projects come first; each card shows its domain and year.

2. **Data-driven content**:
   - All portfolio content lives in `/data/*.json`.
   - `js/render.js` builds the page from that data.

3. **Sections**:
   - **Projects**: 3-level cumulative (AND) filter by Type, Domain and Topic, with a detail modal and links to each GitHub repository.
   - **Featured**: carousel of three projects with metrics and real code excerpts copied from each repository.
   - **Areas of Expertise**: cards that open a capability modal.
   - **Experience**: vertical timeline with the current role marked and metrics shown inline.
   - **Skills, Organisations, Education & Certifications**.
   - **Download CV**: Data and Software versions in `/cv/`.
   - **Archie AI Assistant (Chatbot)**: answers are built from the same `/data` JSON the page renders, so they cannot drift out of sync. Built-in answers are English; an optional Groq API key enables other languages.
   - **Contact Form**: sends via [Formspree](https://formspree.io) when `contact.formEndpoint` is set in `data/profile.json`; otherwise opens the visitor's email app.
   - **Mini-games**: **2048** (`/2048/`) and **Snake** (`/Snake/`), linked from the footer.

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
│   ├── carousel.js          # Featured carousel & experience timeline
│   ├── modal.js             # Accessible modal dialog system
│   ├── chatbot.js           # Floating assistant, answers from /data JSON
│   └── reveal.js            # IntersectionObserver, count-up stats, & spy
├── data/                    # Structured JSON content
│   ├── profile.json
│   ├── expertise.json
│   ├── active-projects.json
│   ├── experience.json
│   ├── skills.json
│   ├── organizations.json
│   ├── education.json
│   ├── certifications.json
│   └── projects.json
├── image/                   # Optimised images
├── cv/                      # Downloadable CV PDFs
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
