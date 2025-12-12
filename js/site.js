/* ============================================
   COASTAL SPICE KITCHEN — Unified Site JS
   Nav toggle, scroll reveal, reservation form,
   premium chatbot widget
   ============================================ */
(function () {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------- NAV TOGGLE ---------- */
  function initNav() {
    const toggle = $('#navToggle');
    const nav = $('#primaryNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      nav.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? '☰' : '✕';
    });

    // Close on link click (mobile)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(el => io.observe(el));
  }

  /* ---------- SCROLL DOWN HINT ---------- */
  function initScrollHint() {
    const scrollHint = $('.hero-scroll-hint');
    if (!scrollHint) return;

    scrollHint.style.cursor = 'pointer';
    scrollHint.addEventListener('click', () => {
      const aboutSection = $('#about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ---------- RESERVATION FORM ---------- */
  function initReservation() {
    const form = $('#reservationForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.phone || !data.date) {
        alert('Please fill in all required fields.');
        return;
      }

      // Demo: log and confirm
      console.log('Reservation:', data);
      alert(`Thank you, ${data.name}! Your reservation for ${data.date} at ${data.time || 'your chosen time'} is received.`);
      form.reset();
    });
  }

  /* ---------- CHATBOT WIDGET WITH GEMINI API ---------- */
  function ChatWidget() {
    this.apiKey = 'AIzaSyCJTqJo2VTzFl3WJXaS7nrYF3OydNrNVCg';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.useAPI = true;
    this.open = false;
    this._welcomed = false;
    this.build();
    this.bind();
  }

  ChatWidget.prototype.build = function () {
    // FAB
    const fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.innerHTML = '💬';

    // Window
    const win = document.createElement('div');
    win.className = 'chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-hidden', 'true');
    win.innerHTML = `
      <div class="chat-head">
        <div class="logo">CS</div>
        <div class="title">
          <div class="name">Coastal Spice Assistant</div>
          <div class="status" id="chatStatus">Online - Powered by AI</div>
        </div>
        <button class="chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-quick">
        <button data-q="What are your menu highlights?">🍛 Menu</button>
        <button data-q="What are your opening hours?">🕒 Hours</button>
        <button data-q="How do I make a reservation?">📅 Reserve</button>
        <button data-q="What are today's specials?">⭐ Specials</button>
      </div>
      <div class="chat-input-wrap">
        <input id="chatInput" type="text" placeholder="Ask me anything..." aria-label="Message">
        <button class="chat-send" aria-label="Send">➤</button>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    this.fab = fab;
    this.win = win;
    this.body = win.querySelector('#chatBody');
    this.input = win.querySelector('#chatInput');
    this.sendBtn = win.querySelector('.chat-send');
    this.closeBtn = win.querySelector('.chat-close');
    this.quickBtns = win.querySelector('.chat-quick');
    this.statusEl = win.querySelector('#chatStatus');
  };

  ChatWidget.prototype.bind = function () {
    this.fab.addEventListener('click', () => this.toggle());
    
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.send());
    this.input.addEventListener('keydown', e => { if (e.key === 'Enter') this.send(); });

    this.quickBtns.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      this.input.value = btn.dataset.q;
      this.send();
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
  };

  ChatWidget.prototype.toggle = function () {
    this.open ? this.close() : this.openChat();
  };

  ChatWidget.prototype.openChat = function () {
    this.win.classList.add('open');
    this.win.setAttribute('aria-hidden', 'false');
    this.open = true;
    this.input.focus();

    if (!this._welcomed) {
      this._welcomed = true;
      this.postBot('<strong>Welcome to Coastal Spice Kitchen!</strong> 🍛<br>I am here to help you with reservations, menu information, hours, and more. How can I assist you today?');
    }
  };

  ChatWidget.prototype.close = function () {
    this.win.classList.remove('open');
    this.win.setAttribute('aria-hidden', 'true');
    this.open = false;
  };

  ChatWidget.prototype.postBot = function (html) {
    const msg = document.createElement('div');
    msg.className = 'msg bot';
    msg.innerHTML = '<div class="bubble bot">' + this.formatMessage(html) + '</div>';
    this.body.appendChild(msg);
    requestAnimationFrame(() => msg.classList.add('show'));
    this.body.scrollTop = this.body.scrollHeight;
  };

  ChatWidget.prototype.postUser = function (text) {
    const msg = document.createElement('div');
    msg.className = 'msg user';
    msg.innerHTML = '<div class="bubble user">' + escapeHtml(text) + '</div>';
    this.body.appendChild(msg);
    requestAnimationFrame(() => msg.classList.add('show'));
    this.body.scrollTop = this.body.scrollHeight;
  };

  ChatWidget.prototype.formatMessage = function (text) {
    var formatted = text;
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/^[\-\*]\s+(.+)$/gm, '&#8226; $1');
    return formatted;
  };

  ChatWidget.prototype.showTyping = function () {
    if (this.typingEl) return;
    const typing = document.createElement('div');
    typing.className = 'msg bot typing-msg';
    typing.innerHTML = '<div class="bubble bot"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    this.body.appendChild(typing);
    this.typingEl = typing;
    requestAnimationFrame(() => typing.classList.add('show'));
    this.body.scrollTop = this.body.scrollHeight;
    this.statusEl.textContent = 'Typing...';
  };

  ChatWidget.prototype.hideTyping = function () {
    if (this.typingEl) {
      this.typingEl.remove();
      this.typingEl = null;
    }
    this.statusEl.textContent = 'Online - Powered by AI';
  };

  ChatWidget.prototype.send = function () {
    const val = this.input.value.trim();
    if (!val) return;
    this.postUser(val);
    this.input.value = '';
    this.processMessage(val);
  };

  ChatWidget.prototype.processMessage = async function (message) {
    if (this.useAPI) {
      await this.getGeminiResponse(message);
    } else {
      this.getFallbackResponse(message);
    }
  };

  ChatWidget.prototype.getGeminiResponse = async function (userMessage) {
    this.showTyping();

    const context = 'You are a friendly and intelligent AI assistant for Coastal Spice Kitchen, an authentic Andhra coastal cuisine restaurant in Vijayawada, India.\n\n' +
      'IMPORTANT INSTRUCTIONS:\n' +
      '- Answer ALL questions naturally and conversationally\n' +
      '- For casual questions (like "how are you"), respond warmly then guide back to restaurant help\n' +
      '- Keep responses concise (under 100 words) but informative\n' +
      '- Use emojis occasionally to add warmth\n' +
      '- Be professional yet friendly\n\n' +
      'RESTAURANT INFORMATION:\n' +
      'Location: Door No: 27-17-46, MG Road, Labbipet, Vijayawada, Andhra Pradesh - 520010\n' +
      'Phone: +91 91234 56789\n' +
      'Email: contact@coastalspice.in\n\n' +
      'Hours: Monday-Sunday, 11:00 AM - 10:00 PM\n\n' +
      'Menu Highlights:\n' +
      '- Andhra Chicken Biryani (Rs.249) - Fragrant spice, tender chicken\n' +
      '- Gongura Mutton (Chefs pick) - Tangy gongura leaves, slow-simmered\n' +
      '- Nellore Fish Pulusu (Rs.299) - Coastal-style fish curry\n' +
      '- Royyala Vepudu/Prawn Fry (Rs.299) - Crispy prawns with curry leaves\n' +
      '- Avakaya Biryani (Rs.219) - Pickled mango infused biryani\n' +
      '- Mango Pulihora (Seasonal) - Tangy and aromatic\n\n' +
      'Chef Specials:\n' +
      '- Weekend Thali - Coastal favourites with prawns, fish curry, rice and sides\n' +
      '- Sunday Slow-Cook - Gongura Mutton and other long-simmered specialties\n' +
      '- Shellfish Platter - Freshest catch, pan-roasted and glazed\n\n' +
      'Reservations: Recommended for groups of 4+. Can book online or call.\n\n' +
      'User question: ' + userMessage + '\n\nRespond naturally and helpfully:';

    try {
      const response = await fetch(this.apiUrl + '?key=' + this.apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 250,
            topP: 0.95
          }
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;

      this.hideTyping();
      this.postBot(botResponse);

    } catch (error) {
      console.error('Gemini API Error:', error);
      this.useAPI = false;
      this.hideTyping();
      this.getFallbackResponse(userMessage);
    }
  };

  ChatWidget.prototype.getFallbackResponse = function (message) {
    this.showTyping();
    const lc = message.toLowerCase();
    var response = '';

    if (lc.includes('reserv') || lc.includes('book') || lc.includes('table')) {
      response = '🍽️ We would love to have you! For reservations:\n\n📞 Call us at +91 91234 56789\n📅 Use our online reservation form on this page\n\nWe recommend booking ahead for groups of 4 or more!';
    } else if (lc.includes('hour') || lc.includes('open') || lc.includes('close') || lc.includes('time')) {
      response = '🕐 Our Hours:\n\nMonday - Sunday: 11:00 AM - 10:00 PM\n\n📍 Located at MG Road, Labbipet, Vijayawada';
    } else if (lc.includes('menu') || lc.includes('food') || lc.includes('dish') || lc.includes('biryani')) {
      response = '🍛 Our Menu Highlights:\n\n- Andhra Chicken Biryani (Rs.249)\n- Gongura Mutton (Chefs pick)\n- Nellore Fish Pulusu (Rs.299)\n- Royyala Vepudu (Rs.299)\n- Avakaya Biryani (Rs.219)\n\nAll dishes follow authentic coastal Andhra recipes!';
    } else if (lc.includes('special')) {
      response = '⭐ Todays Specials:\n\n- Coastal Seafood Thali\n- Mango Pulihora (seasonal)\n- Sunday Slow-Cook Gongura Mutton\n\nAsk your server for recommendations!';
    } else if (lc.includes('location') || lc.includes('address') || lc.includes('where')) {
      response = '📍 Our Location:\n\nDoor No: 27-17-46, MG Road, Labbipet\nVijayawada, Andhra Pradesh - 520010\n\n📞 +91 91234 56789\n📧 contact@coastalspice.in';
    } else if (lc.includes('contact') || lc.includes('phone') || lc.includes('call') || lc.includes('email')) {
      response = '📞 Contact Us:\n\nPhone: +91 91234 56789\nEmail: contact@coastalspice.in\n\nWe are here to help!';
    } else if (lc.includes('hello') || lc.includes('hi') || lc.includes('hey')) {
      response = 'Hello! 👋 Welcome to Coastal Spice Kitchen! How can I assist you today? Feel free to ask about our menu, hours, reservations, or specials!';
    } else {
      response = 'I am here to help! 😊 You can ask me about:\n\n🍛 Our menu and specialties\n🕐 Opening hours\n📅 Making reservations\n📍 Location and contact info\n\nWhat would you like to know?';
    }

    setTimeout(() => {
      this.hideTyping();
      this.postBot(response);
    }, 600);
  };

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- INIT ---------- */
  /* ---------- IMAGE HOVER WITH FOOD NAMES ---------- */
  function initImageHover() {
    const images = $$('img[data-food]');
    images.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.className = 'image-hover-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      
      const overlay = document.createElement('div');
      overlay.className = 'image-hover-overlay';
      overlay.textContent = img.getAttribute('data-food');
      
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      wrapper.appendChild(overlay);
    });
  }

  function init() {
    initNav();
    initReveal();
    initScrollHint();
    initReservation();
    initImageHover();
    new ChatWidget();

    // Footer year
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
