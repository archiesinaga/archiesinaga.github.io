/**
 * chatbot.js - Interactive Portfolio AI Assistant
 * Persona: Helpful, cheerful assistant for Archie P. H. Sinaga.
 * Features:
 * - Multi-language support (EN, ID, ZH, AR, JA)
 * - Quick prompt chips
 * - Local intelligent fallback knowledge base from loaded JSON
 * - Support for custom Groq / OpenAI / Gemini API key
 * - Free quota counter in localStorage
 * - Project deep-link "Ask AI about this" trigger
 */

const QUOTA_KEY = 'archie_chatbot_quota';
const API_KEY_STORAGE = 'archie_chatbot_user_key';
const MAX_FREE_MESSAGES = 10;

export class PortfolioChatbot {
  constructor(knowledgeContext = {}) {
    this.context = knowledgeContext;
    this.isOpen = false;
    this.currentLang = 'EN';
    this.messages = [];
    this.panel = document.getElementById('chatbot-panel');
    this.trigger = document.getElementById('chatbot-trigger');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.inputField = document.getElementById('chatbot-input');
    this.sendBtn = document.getElementById('chatbot-send-btn');
    this.langSelect = document.getElementById('chatbot-lang-select');
    this.quotaBadge = document.getElementById('chatbot-quota-badge');

    this.init();
  }

  init() {
    this.setupEvents();
    this.updateQuotaDisplay();
    
    // Initial friendly greeting
    this.appendBotMessage(
      `👋 Hello! I am Archie's AI Portfolio Assistant. Ask me anything about his AI/ML projects, data analytics, work experience, or how to get in touch!`
    );
  }

  setupEvents() {
    if (this.trigger) {
      this.trigger.addEventListener('click', () => this.toggle());
    }

    const closeBtn = document.getElementById('chatbot-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (this.sendBtn && this.inputField) {
      this.sendBtn.addEventListener('click', () => this.handleSend());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
    }

    if (this.langSelect) {
      this.langSelect.addEventListener('change', (e) => {
        this.currentLang = e.target.value;
        const langAck = {
          EN: "Language switched to English. How can I assist you with Archie's portfolio?",
          ID: "Bahasa diubah ke Bahasa Indonesia. Ada yang bisa saya bantu terkait profil dan pengalaman Archie?",
          ZH: "语言已切换为中文。有什么可以帮您了解 Archie 的？",
          AR: "تم تغيير اللغة إلى العربية. كيف يمكنني مساعدتك بخصوص ملف Archie؟",
          JA: "言語を日本語に切り替えました。Archie の経歴やスキルについて何かご質問はありますか？"
        };
        this.appendBotMessage(langAck[this.currentLang] || langAck.EN);
      });
    }

    // Quick chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          this.inputField.value = query;
          this.handleSend();
        }
      });
    });

    // Listen for custom "Ask AI about this" events from external sections
    document.addEventListener('ask-ai', (e) => {
      const topic = e.detail?.topic || '';
      this.open();
      if (topic) {
        this.inputField.value = `Tell me more about the project: ${topic}`;
        this.handleSend();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.panel?.classList.add('open');
    this.panel?.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.inputField?.focus(), 150);
  }

  close() {
    this.isOpen = false;
    this.panel?.classList.remove('open');
    this.panel?.setAttribute('aria-hidden', 'true');
  }

  getQuotaUsed() {
    return parseInt(localStorage.getItem(QUOTA_KEY) || '0', 10);
  }

  incrementQuota() {
    const current = this.getQuotaUsed();
    localStorage.setItem(QUOTA_KEY, (current + 1).toString());
    this.updateQuotaDisplay();
  }

  updateQuotaDisplay() {
    if (!this.quotaBadge) return;
    const used = this.getQuotaUsed();
    const remaining = Math.max(0, MAX_FREE_MESSAGES - used);
    this.quotaBadge.textContent = `${remaining} free msgs left`;
  }

  async handleSend() {
    const text = this.inputField.value.trim();
    if (!text) return;

    this.inputField.value = '';
    this.appendUserMessage(text);

    // Show typing indicator
    const typingId = this.showTypingIndicator();

    try {
      const response = await this.generateResponse(text);
      this.removeTypingIndicator(typingId);
      this.appendBotMessage(response);
      this.incrementQuota();
    } catch (err) {
      this.removeTypingIndicator(typingId);
      this.appendBotMessage("Sorry, I encountered a temporary network issue. Please feel free to ask again or reach out directly to Archie via email at archiesinaga9@gmail.com!");
    }
  }

  appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.textContent = text;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  }

  appendBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = this.formatMessageText(text);
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  }

  formatMessageText(raw) {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.2);padding:2px 4px;border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br/>');
  }

  showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-msg bot';
    div.innerHTML = `<span style="font-style: italic; color: var(--text-muted);">Archie's Assistant is typing...</span>`;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  async generateResponse(query) {
    const qLower = query.toLowerCase();

    // Check for user-provided custom API key in localStorage
    const userApiKey = localStorage.getItem(API_KEY_STORAGE);
    if (userApiKey && this.getQuotaUsed() >= MAX_FREE_MESSAGES) {
      return await this.callExternalLLM(query, userApiKey);
    }

    // High quality contextual local intelligence agent
    await new Promise(r => setTimeout(r, 500)); // natural typing delay

    if (qLower.includes('tech stack') || qLower.includes('skills') || qLower.includes('language') || qLower.includes('tool')) {
      return `Archie's core technical stack includes:
• **Programming & Querying**: Python (Advanced), SQL (Advanced), JavaScript, R, HTML5/CSS3.
• **AI & Machine Learning**: Machine Learning (Advanced), Generative AI, Hybrid RAG, Agentic AI, ConvNeXt, ResNet-50, TensorFlow, NLP.
• **Data Analytics & BI**: Tableau (Advanced), Power BI, Looker Studio, Pandas, Advanced Excel.
• **Backend & Web**: Express.js, Node.js, PostgreSQL, MySQL, Redis, Nginx, RESTful APIs.
• **Design & Tools**: Adobe Illustrator (Certified), Affinity Designer/Canva, Figma, Git, Google Colab.`;
    }

    if (qLower.includes('octagon') || qLower.includes('digital twin') || qLower.includes('rag') || qLower.includes('gonsters')) {
      return `**Octagon** is an agentic Digital Twin assistant engineered at **Gonsters** for industrial telemetry monitoring and predictive maintenance.
Key accomplishments:
• Built a Hybrid RAG (Hot/Cold path) architecture querying 120+ live telemetry streams, reducing retrieval latency by 40%.
• Implemented proprietary 'TOON' structured formatting, achieving 95% response accuracy and zero hallucinations across 9+ industrial benchmarks (OEE, Predictive Maintenance).
• Developed autonomous workflows triggered by machine alarms for root cause analysis and ticket routing.
• Achieved sub-200ms latency via Redis and Nginx caching layers.`;
    }

    if (qLower.includes('bacteria') || qLower.includes('thesis') || qLower.includes('education') || qLower.includes('gpa') || qLower.includes('university') || qLower.includes('unsri')) {
      return `Archie graduated in **Informatics Engineering from Universitas Sriwijaya** with a **3.92 / 4.00 GPA (Cum Laude)**!
His undergraduate thesis focused on **Bacterial Microscopic Image Classification** using modern deep learning architectures (ConvNeXt & ResNet-50) evaluated on the benchmark DIBaS microscopic dataset.
He also placed **Top 3** in a Smart Farming IoT competition and built an expert system for oil palm tree diseases using Simple Additive Weighting (SAW).`;
    }

    if (qLower.includes('alc') || qLower.includes('lms') || qLower.includes('learning center') || qLower.includes('fraud')) {
      return `At **Alpha Omega Learning Center (ALC)**, Archie serves as **Data Analyst, Web Developer & Social Media Specialist**:
• Engineered a scalable Learning Management System (LMS) monitoring daily grades and exercises for 600+ students.
• Co-developed a financial cash flow audit program that uncovered IDR 19 million in fraudulent discrepancies and losses over a 9-month audit.
• Analyzed social media engagement to drive a marketing strategy that increased student enrollments by 120 within 3 months.`;
    }

    if (qLower.includes('dagangan') || qLower.includes('retail') || qLower.includes('cohort')) {
      return `**PT. Dagangan Karya Indonesia Analysis Project**:
A commercial retail analytics and exploratory data modeling initiative:
• Evaluated transactional patterns, hub regional distribution, and basket sizes for PT. Dagangan Karya Indonesia.
• Built automated Python/Pandas data cleansing workflows and interactive Tableau dashboards.
• Co-authored the final research paper, awarded **Third Best Presentation Team** nationally at Bitlabs MSIB Batch 7!`;
    }

    if (qLower.includes('truck') || qLower.includes('tracking') || qLower.includes('logistics')) {
      return `**Real-Time Truck Tracking System**:
Developed during Archie's IT Internship at **PT Sumatera Prima Fiberboard**:
• Built real-time dispatch and route monitoring tracking 10-20 transport trucks daily across 4 industrial checkpoints.
• Unified PostgreSQL, REST APIs, and Leaflet mapping to give logistics managers full gate visibility and eliminate bottleneck delays.`;
    }

    if (qLower.includes('project') || qLower.includes('portfolio') || qLower.includes('work')) {
      return `Archie's featured projects are:
1. **Real-Time Truck Tracking System** (PT Sumatera Prima Fiberboard — Live dispatch monitoring for 10-20 trucks across 4 checkpoints)
2. **ALC Learning — Learning Management System** (Alpha Omega Learning Center — Production LMS for 600+ students & financial cash flow auditing)
3. **PT. Dagangan Karya Indonesia Analysis Project** (Commercial business analytics & Tableau dashboarding — Top 3 National Presentation Award)
Explore the **Portfolio & Projects** section above to view all technical details and stack breakdowns!`;
    }

    if (qLower.includes('experience') || qLower.includes('career') || qLower.includes('intern') || qLower.includes('job')) {
      return `Archie's professional track record includes:
• **Gonsters**: Generative AI Engineer (Octagon Digital Twin, Hybrid RAG, Agentic AI)
• **Alpha Omega Learning Center (ALC)**: Data Analyst, Web Developer & Social Media Specialist (LMS architecture, fraud forensics, growth analytics)
• **PT Sumatera Prima Fiberboard**: IT Intern (Real-time truck dispatch tracking, digital memo approval workflow across 8 divisions)
• **Bitlabs Academy (MSIB Batch 7)**: Data Analytics for Business Cohort Participant (Awarded 3rd Best Presentation Team nationally)`;
    }

    if (qLower.includes('contact') || qLower.includes('hire') || qLower.includes('email') || qLower.includes('phone') || qLower.includes('reach')) {
      return `You can connect with Archie directly:
📧 Email: **archiesinaga9@gmail.com**
📱 Phone / WhatsApp: **+6281250233529**
📍 Location: Palembang, South Sumatra, Indonesia (WIB / UTC+7)
🔗 LinkedIn: [linkedin.com/in/archie-ph-sinaga/](https://linkedin.com/in/archie-ph-sinaga/)
⚡ Response time: Under 24 hours.
He is open for AI Engineer, Machine Learning, Data Analyst, Web Developer, and Banking/Finance ODP opportunities!`;
    }

    // Default response
    return `Thank you for asking! Archie P. H. Sinaga is an Informatics Engineering graduate from Sriwijaya University (GPA 3.92/4.00) specializing in AI/ML, Generative AI (RAG & Agentic Systems), Data Analytics, and Web Development.
Feel free to ask about his **Octagon Digital Twin**, **LMS Platform**, **Deep Learning Thesis**, or **Contact details**!`;
  }

  async callExternalLLM(prompt, apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are the AI portfolio assistant for Archie P. H. Sinaga, an Informatics Engineering graduate from Universitas Sriwijaya (GPA 3.92/4.00) specializing in AI/ML, Generative AI, Data Analytics, and Web Development based in Palembang, Indonesia. Answer politely and accurately in ${this.currentLang}. Keep answers concise and helpful.`
            },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return "Unable to reach the AI cloud endpoint. Falling back: Archie P. H. Sinaga is available for AI/ML, Data Analytics, and Web Developer roles. Reach him directly at archiesinaga9@gmail.com!";
    }
  }
}
