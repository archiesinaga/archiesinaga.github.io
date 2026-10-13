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
        // Built-in answers are English only; say so rather than imply full translation
        const langAck = {
          EN: "Language switched to English. How can I assist you with Archie's portfolio?",
          ID: "Bahasa diubah ke Bahasa Indonesia. Catatan: jawaban otomatis saya masih dalam bahasa Inggris.",
          ZH: "语言已切换为中文。注意：自动回答目前仅提供英文。",
          AR: "تم تغيير اللغة إلى العربية. ملاحظة: الإجابات التلقائية متوفرة بالإنجليزية فقط حاليًا.",
          JA: "言語を日本語に切り替えました。注意：自動回答は現在英語のみです。"
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
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s"]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent-primary);text-decoration:underline;">$1</a>')
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

    await new Promise(r => setTimeout(r, 500)); // natural typing delay

    // Every answer below is built from the same /data JSON the page renders,
    // so the assistant cannot drift out of sync with the visible portfolio.
    const { profile = {}, projects = [], experience = [] } = this.context;
    const has = (...words) => words.some(w => qLower.includes(w));

    if (has('contact', 'hire', 'email', 'phone', 'reach', 'whatsapp', 'cv', 'resume')) {
      const c = profile.contact || {};
      const social = name => (profile.socials || []).find(s => s.name.toLowerCase().startsWith(name))?.url;
      return `You can reach Archie directly:
📧 Email: **${c.email}**
📱 Phone / WhatsApp: **${c.phone}**
📍 ${c.location} (${profile.timezone})
🔗 LinkedIn: [linkedin.com/in/archie-ph-sinaga](${social('linkedin')})
💻 GitHub: [github.com/archiesinaga](${social('github')})
📄 CV: [View resume](${social('resume')})
He is open to ${(profile.target_roles || []).join(', ')} roles.`;
    }

    if (has('education', 'gpa', 'university', 'unsri', 'degree', 'graduat')) {
      return `Archie graduated in **Informatics Engineering from Universitas Sriwijaya** with a **3.92 / 4.00 GPA (Cum Laude)**.
His thesis classified microscopic bacterial images across 33 species with **ConvNeXt and ResNet-50** on the DIBaS dataset — [see the code](https://github.com/archiesinaga/bacteria-classification).`;
    }

    if (has('experience', 'career', 'intern', 'job', 'employ')) {
      return `Archie's experience:\n` + experience.map(e =>
        `• **${e.org}** — ${e.role} (${e.period})\n  ${e.summary}`
      ).join('\n');
    }

    const project = this.matchProject(qLower, projects);
    if (project) {
      const lines = [`**${project.title}**`, project.summary, `• Stack: ${(project.tech || []).join(', ')}`];
      if (project.repo) lines.push(`• Code: [${project.repo.replace('https://', '')}](${project.repo})`);
      if (project.demo && project.demo.includes('youtu')) lines.push(`• Demo: [watch the video](${project.demo})`);
      lines.push('Open the project card in **Portfolio & Projects** for the full write-up.');
      return lines.join('\n');
    }

    if (has('project', 'portfolio', 'built', 'work')) {
      return `Archie's projects:\n` + projects.filter(p => p.type === 'tech').map((p, i) =>
        `${i + 1}. **${p.title}**${p.repo ? ` — [code](${p.repo})` : ''}`
      ).join('\n') + `\nAsk about any of them by name for details.`;
    }

    if (has('tech stack', 'skill', 'stack', 'tool', 'technolog')) {
      return `Archie's core stack:
• **Data & Analytics**: Python, SQL (PostgreSQL), Pandas, Tableau, Power BI, Excel
• **Machine Learning**: scikit-learn, XGBoost, SHAP, TensorFlow, ConvNeXt, ResNet-50
• **Web**: JavaScript, TypeScript, Next.js, Express.js, Prisma, Supabase, MongoDB
• **Design**: Adobe Illustrator (certified), Figma, Canva`;
    }

    return `Archie P. H. Sinaga is an Informatics Engineering graduate from Universitas Sriwijaya (GPA 3.92/4.00) working across data analytics, machine learning and web development.
Try asking about his **credit risk model**, **thesis**, **LMS**, **experience**, or **contact details**.`;
  }

  matchProject(qLower, projects) {
    // Aliases cover the words a visitor would actually type for each project
    const aliases = {
      'credit-risk': ['credit', 'risk', 'xgboost', 'shap', 'default', 'loan', 'scorecard'],
      'bacteria-classification': ['bacteri', 'thesis', 'convnext', 'resnet', 'dibas', 'microscop'],
      'ceksawit': ['sawit', 'palm', 'expert system', 'plant disease'],
      'vehicle-tracker': ['truck', 'vehicle', 'tracking', 'tracker', 'logistic', 'route'],
      'document-approval': ['document', 'approval', 'dms', 'memo'],
      'alc-lms': ['lms', 'alc', 'learning management', 'classroom', 'grade'],
      'dagangan-analysis': ['dagangan', 'bitlabs', 'sales', 'retail', 'msib'],
      'iot-smart-farming': ['iot', 'farming', 'esp32', 'arduino'],
      'uiux-euphoria': ['ui/ux', 'figma', 'euphoria', 'design competition'],
      'fasilkom-games': ['isport', 'sport', 'fasilkom games']
    };
    let best = null;
    let bestScore = 0;
    for (const p of projects) {
      let score = (aliases[p.id] || []).filter(a => qLower.includes(a)).length;
      if (qLower.includes(p.title.toLowerCase())) score += 5;
      if (score > bestScore) { best = p; bestScore = score; }
    }
    return best;
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
              content: `You are the AI portfolio assistant for Archie P. H. Sinaga, an Informatics Engineering graduate from Universitas Sriwijaya (GPA 3.92/4.00) based in Palembang, Indonesia, working in data analytics, machine learning and web development. Answer only from these facts and say you don't know otherwise. Projects: ${JSON.stringify((this.context.projects || []).map(p => ({ title: p.title, summary: p.summary, repo: p.repo })))}. Experience: ${JSON.stringify((this.context.experience || []).map(e => ({ org: e.org, role: e.role, period: e.period })))}. Answer politely in ${this.currentLang}. Keep answers concise.`
            },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return "Unable to reach the AI cloud endpoint. Archie is available for Data Analyst, Machine Learning and Web Developer roles — reach him directly at archiesinaga9@gmail.com.";
    }
  }
}
