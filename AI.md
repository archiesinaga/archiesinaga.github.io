# Panduan Membangun Website Portfolio Interaktif (Vibe Coding Spec)

Dokumen ini adalah **spesifikasi pembuatan**, bukan isi konten. Semua teks, nama, dan data pribadi diganti placeholder `{{...}}` dan dimuat dari file data terpisah. Gunakan dokumen ini sebagai konteks utama saat meminta AI coding assistant membangun website.

---

## 1. Tujuan & Gaya

- **Jenis**: single-page portfolio personal untuk developer / AI / data professional.
- **Karakter**: ilustratif, playful, bertema alam + fosil/prasejarah, tetapi tetap profesional dan mudah dipindai.
- **Prinsip**: storytelling visual di hero, informasi padat dan rapi di section lain, interaktivitas yang bermakna (filter, modal, chatbot), bukan sekadar dekorasi.
- **Bahasa UI**: Inggris (konten bisa dibuat multi-bahasa belakangan).

---

## 2. Tech Stack

| Lapisan | Pilihan utama | Alternatif |
|---|---|---|
| Markup/Style/Script | HTML5, CSS3 (custom properties), Vanilla JS (ES modules) | React / Next.js + Tailwind |
| Hosting | GitHub Pages (statis) | Vercel, Netlify |
| Data konten | File JSON lokal (`/data/*.json`) | Headless CMS |
| Komentar live | Firebase Firestore / Supabase | Giscus (GitHub Discussions) |
| Chatbot AI | Groq API (Llama 3.3) via fetch | OpenAI / Anthropic / Gemini API |
| Ikon teknologi | Simple Icons (CDN) | SVG lokal |
| Font | Google Fonts (1 display + 1 body) | Font sistem |

Aturan: tanpa build step jika memilih vanilla, semua aset gambar format **WebP**, ikon **SVG**.

---

## 3. Design System

### 3.1 Design tokens (CSS custom properties)

Definisikan di `:root` dan override untuk `[data-theme="dark"]` dan `[data-theme="light"]`.

```css
:root {
  --bg: ;            /* latar utama */
  --bg-elevated: ;   /* kartu / modal */
  --surface-border: ;
  --text: ;
  --text-muted: ;
  --accent: ;        /* satu warna aksen utama */
  --accent-2: ;      /* aksen sekunder (opsional) */
  --radius: 16px;
  --shadow: ;
  --transition: 250ms ease;
}
```

### 3.2 Tema

- **Default: Dark (night) mode**, dengan toggle ikon bulan/matahari di navbar.
- Simpan pilihan di `localStorage`, hormati `prefers-color-scheme` pada kunjungan pertama.
- Light mode wajib selesai sebelum rilis. Jika belum, sembunyikan toggle-nya (jangan tampilkan popup "under development").

### 3.3 Tipografi & Layout

- Skala heading dengan `clamp()` agar responsif.
- Container maksimum ±1200px, grid 12 kolom atau CSS Grid auto-fit untuk kartu.
- Spacing konsisten (kelipatan 4/8px).

### 3.4 Aset ilustrasi (perlu disiapkan/dibuat)

- Karakter avatar kartun (PNG/WebP transparan) + varian kosmetik.
- Elemen hero berlapis: latar, bulan/matahari, kupu-kupu, serangga, jangkrik (layer terpisah, transparan).
- Pola latar fosil (±15 varian kecil, satu warna navy) untuk dekorasi section.
- Ilustrasi penutup footer (fosil ekor dinosaurus).

---

## 4. Struktur Halaman

Single page dengan anchor navigation. Urutan section:

```
Navbar (sticky)
├─ Hero
├─ Intro + Stats + Marquee Logo
├─ About + Areas of Expertise (kartu klik → modal)
├─ News & Activities (proyek aktif + artikel/post)
├─ Experience (carousel timeline)
├─ Activities & Skills (organisasi, tech stack, pendidikan, sertifikasi)
├─ Portfolio & Projects (grid + filter 3 tingkat)
├─ Contact (info + form)
├─ Visitor Comments
└─ Footer
Floating: Chatbot widget, Modal layer
```

### 4.1 Navbar

- Link anchor: Home, About, News, Experience, Skills, Portfolio, Contact.
- Dropdown "More" → mini-game.
- Ikon sosial (GitHub, LinkedIn, Instagram, Spotify, CV) dan toggle tema.
- Sticky + efek blur saat scroll; hamburger menu di mobile; highlight link aktif memakai `IntersectionObserver`.

### 4.2 Hero

- Komposisi ilustrasi berlapis dengan efek **parallax ringan** (mouse move di desktop, scroll di mobile).
- Isi: moto `{{motto}}`, nama `{{full_name}}`, lokasi `{{country}}`, satu tombol CTA ke section berikutnya.
- Animasi kecil pada elemen dekoratif (serangga bergerak, bulan/matahari berayun), hormati `prefers-reduced-motion`.

### 4.3 Intro + Stats + Marquee

- Judul sapaan + peran `{{headline_role}}`.
- 3 kartu statistik `{{stat_value}} + {{stat_label}}` dengan **count-up animation** saat masuk viewport.
- Avatar di samping.
- Marquee logo organisasi/kolaborasi yang berjalan tanpa henti (duplikasi track, `animation: scroll linear infinite`, pause saat hover).

### 4.4 About + Areas of Expertise

- Satu paragraf pitch `{{about_text}}`.
- Grid 8 kartu keahlian (ikon, judul, deskripsi satu kalimat). Klik kartu → **modal detail** berisi capability dan stack.

### 4.5 News & Activities

- **Kartu proyek aktif** (2 kartu besar): badge status, judul, subjudul, deskripsi, 2 highlight fitur, tag teknologi, tombol link, tombol "Ask AI about this", panel cuplikan kode, dan 2 metrik angka.
- **Feed publikasi**: kartu artikel (platform, tanggal, judul, ringkasan, hashtag, link) dan kartu update LinkedIn.
- Data diambil dari `news.json`. Opsional: tarik GitHub commits terbaru via GitHub REST API (cache di `sessionStorage`).

### 4.6 Experience (Carousel Timeline)

- Kartu per pengalaman: foto, periode, jabatan, institusi, deskripsi, tag skill, tombol "Click for Metrics".
- Navigasi: tombol Prev/Next, indikator angka/dot, swipe di mobile, dukungan keyboard (←/→).
- Tombol metrics membuka modal berisi pencapaian terukur.
- Urutkan kronologis; ada penanda "Present" untuk peran yang masih berjalan.

### 4.7 Activities & Skills

- **Activities**: daftar organisasi (logo, nama, peran, periode).
- **Technical Skills**: tab/filter kategori (All, Languages, Frontend, Backend, AI/ML, Data & BI, Cloud & DevOps, Tools, Design). Tiap skill = ikon + label.
- **Education**: kartu (logo, institusi, program, tahun).
- **Certifications**: grid kartu dengan filter kategori; klik → modal preview sertifikat.

### 4.8 Portfolio & Projects

- Grid kartu proyek: label kategori, judul, deskripsi 1-2 kalimat, tag teknologi, link keluar.
- **Filter 3 tingkat**:
  1. Jenis: All / Tech / Non-Tech
  2. Domain: AI/ML, Data Science, Full Stack, UI/UX, Algorithms, dst.
  3. Topik: sub-tag (RAG, Multi-Agent, NLP, EDA, dst.)
- Filter bersifat kumulatif (AND), tampilkan jumlah hasil, empty state jika tidak ada hasil.
- Klik kartu bisa membuka modal preview (opsional) atau langsung link.
- Pagination atau "Load more" jika proyek > 12.

### 4.9 Contact

- Info: email, lokasi/zona waktu, tautan sosial, estimasi waktu respons.
- **Form**: nama, email, subjek, pesan. Validasi di sisi klien, honeypot anti-spam, kirim via Formspree / EmailJS / serverless function. Tampilkan status sukses/gagal.

### 4.10 Visitor Comments

- Form: nama*, email (opsional, privat), role (opsional), rating bintang*, pesan*.
- Daftar komentar tampil live (urut terbaru). Email **tidak pernah** ditampilkan publik.
- **Filter kata kasar** + penjagaan prompt-injection sederhana (blokir pola instruksi mencurigakan).
- Sanitasi semua input (jangan pernah `innerHTML` dengan data pengguna), batasi panjang, dan rate-limit per perangkat.
- "Admin mode" untuk menghapus komentar; autentikasi via Firebase Auth/Supabase Auth, **bukan** password di kode klien.

### 4.11 Footer

- Ilustrasi penutup, teks akhir halaman, hak cipta dengan **tahun dinamis** (`new Date().getFullYear()`).

---

## 5. Fitur Interaktif Global

### 5.1 Chatbot Asisten Portfolio

- Widget mengambang (kanan bawah), buka/tutup dengan animasi.
- Persona: asisten ramah yang menjawab seputar pemilik portfolio, dibatasi lewat **system prompt** yang berisi ringkasan konten dari JSON (bukan seluruh halaman).
- Fitur:
  - Pemilih bahasa (EN, ID, ZH, AR, JA); kirim instruksi "jawab dalam bahasa X".
  - Quick-prompt chips: Tech Stack, AI/ML Projects, Work Experience, Contact/Hire.
  - Kuota gratis N pertanyaan (hitung di `localStorage`), lalu pengguna bisa memasukkan **API key sendiri**.
  - Tombol "Ask AI about..." di kartu proyek yang mengisi pesan otomatis.
  - Indikator mengetik, auto-scroll, render Markdown aman.
- **Keamanan**: jangan hardcode API key di repo. Opsi terbaik: serverless proxy (Cloudflare Workers/Vercel Function) yang menyimpan key di environment variable. Jika memakai key milik pengguna, simpan hanya di browser pengguna dan jelaskan itu dengan jelas di UI.
- Guardrail: tolak permintaan di luar topik, jangan mengarang fakta yang tidak ada di konteks.

### 5.2 Modal System

- Satu komponen modal generik: overlay, tombol tutup, `Esc` untuk menutup, focus trap, kunci scroll body.
- Dipakai untuk: expertise detail, metrics pengalaman, preview sertifikat, preview proyek.

### 5.3 Mini-games

- Dua game kecil di halaman terpisah (`/2048/`, `/Snake/`) dari menu "More".
- Kontrol keyboard + swipe/tombol di mobile; skor terbaik di `localStorage`.

### 5.4 Efek Scroll

- Reveal on scroll (fade/slide) memakai `IntersectionObserver`, satu kelas utilitas `.reveal`.
- Back-to-top button muncul setelah scroll ±600px.

---

## 6. Struktur Data (konten terpisah dari kode)

```
/data
├─ profile.json        # nama, moto, headline, about, stats, sosial, kontak
├─ expertise.json      # [{title, icon, summary, details[]}]
├─ news.json           # [{type, title, summary, tags[], date, url}]
├─ active-projects.json
├─ experience.json     # [{role, org, start, end, image, summary, tags[], metrics[]}]
├─ skills.json         # [{category, items:[{name, icon}]}]
├─ education.json
├─ certifications.json # [{title, issuer, category, image, url}]
├─ projects.json       # [{title, summary, type, domain, topics[], tech[], url}]
└─ organizations.json
```

Contoh skema `projects.json`:

```json
{
  "title": "{{project_title}}",
  "summary": "{{one_or_two_sentences}}",
  "type": "tech | non-tech",
  "domain": "ai-ml | data-science | full-stack | ui-ux | algorithms | ...",
  "topics": ["rag", "multi-agent"],
  "tech": ["Python", "LangChain"],
  "url": "https://..."
}
```

Render semua section dari JSON ini via fungsi `render*()` agar update konten tidak perlu menyentuh HTML.

---

## 7. Struktur Folder

```
/
├─ index.html
├─ /css
│  ├─ tokens.css       # variabel tema
│  ├─ base.css         # reset + tipografi
│  ├─ components.css   # kartu, tombol, modal, badge
│  └─ sections.css     # gaya per section
├─ /js
│  ├─ main.js          # init
│  ├─ theme.js
│  ├─ render.js        # render dari JSON
│  ├─ filters.js
│  ├─ carousel.js
│  ├─ modal.js
│  ├─ chatbot.js
│  ├─ comments.js
│  └─ reveal.js
├─ /data               # JSON konten
├─ /image              # header, background, experience, certs, company, techstack
├─ /2048
└─ /Snake
```

---

## 8. Responsif, Aksesibilitas, Performa

- **Breakpoint**: 480 / 768 / 1024 / 1280. Desain mobile-first.
- **Aksesibilitas**: semantic HTML (`header`, `nav`, `main`, `section`), `alt` pada gambar bermakna, kontras minimal WCAG AA di kedua tema, fokus terlihat, ARIA untuk modal/carousel/tab, dukung `prefers-reduced-motion`.
- **Performa**: lazy-load gambar di bawah fold (`loading="lazy"`), kompres WebP, `preload` font utama, defer script, target Lighthouse ≥ 90.
- **SEO**: `<title>`, meta description, Open Graph + Twitter card, favicon, `sitemap.xml`, JSON-LD `Person`.

---

## 9. Urutan Pengerjaan (Prompt Bertahap untuk Vibe Coding)

Kerjakan per fase, uji tiap fase sebelum lanjut.

1. **Fondasi**: struktur folder, `index.html` kerangka semua section, design tokens, toggle dark/light.
2. **Navbar + Hero**: sticky nav, anchor, hero berlapis dengan parallax.
3. **Data layer**: buat semua JSON dengan data dummy dan fungsi render.
4. **Section statis**: Intro/stats/marquee, About, Expertise + modal.
5. **Experience carousel** dan modal metrics.
6. **Skills, Education, Certifications** dengan filter.
7. **Portfolio grid** dengan filter 3 tingkat.
8. **News section** + kartu proyek aktif.
9. **Contact form** + integrasi layanan pengiriman.
10. **Komentar live** (backend, sanitasi, moderasi).
11. **Chatbot** (proxy/API, bahasa, kuota, quick-prompt).
12. **Mini-games**.
13. **Polish**: animasi, aksesibilitas, SEO, performa, cek tautan.

### Template prompt per fase

```
Konteks: kamu membangun portfolio single-page sesuai PORTFOLIO_BUILD_GUIDE.md.
Tugas fase ini: {{nama fase}}.
Batasan: vanilla JS, ikuti design tokens di tokens.css, konten dari /data/*.json,
tanpa library tambahan kecuali disebut.
Output: kode lengkap per file, jelaskan file mana yang berubah.
Kriteria selesai: {{checklist fase}}.
```

---

## 10. Checklist Kualitas Sebelum Rilis

- [ ] Semua tautan keluar dan tombol CTA mengarah ke tujuan yang benar (tidak berputar ke halaman sendiri).
- [ ] Dark dan light mode keduanya lengkap dan terbaca.
- [ ] Tahun di footer dinamis; tidak ada typo pada teks bawaan.
- [ ] Tidak ada API key, password admin, atau kredensial di repo.
- [ ] Input pengguna (komentar, form) tersanitasi dan dibatasi.
- [ ] Carousel, modal, dan filter bisa dipakai dengan keyboard.
- [ ] Tampilan benar di layar 360px sampai 1440px.
- [ ] Skor Lighthouse performa, aksesibilitas, SEO ≥ 90.
- [ ] Tidak ada console error; semua gambar punya fallback/alt.
- [ ] Konten placeholder `{{...}}` sudah terganti seluruhnya.

---

## 11. Catatan untuk AI Assistant

- Jangan menulis ulang file yang tidak berubah; sebutkan file yang diubah.
- Pisahkan konten (JSON) dari presentasi (HTML/CSS) dan logika (JS).
- Utamakan solusi sederhana dan mudah dirawat dibanding dependensi berat.
- Jika ada keputusan desain yang ambigu, pilih opsi yang paling sederhana dan catat asumsinya di komentar kode.