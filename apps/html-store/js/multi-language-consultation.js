/**
 * Multi-language consultation chat component
 * Integrates with the internationalization service for European expansion
 */

class MultiLanguageConsultation {
  constructor(options = {}) {
    this.tenantId = options.tenantId || 'default';
    this.userId = options.userId || 'anonymous';
    this.language = options.language || 'en-US';
    this.consultationServiceUrl = options.consultationServiceUrl || 'https://consultation-service-YOUR_PROJECT_ID.us-central1.run.app';
    this.i18nServiceUrl = options.i18nServiceUrl || 'https://internationalization-service-YOUR_PROJECT_ID.us-central1.run.app';
    
    this.socket = null;
    this.consultationId = null;
    this.translations = {};
    this.isConnected = false;
    
    // Supported languages for European expansion
    this.supportedLanguages = {
      'en-US': { name: 'English', flag: '🇺🇸', priority: 1 },
      'nl-NL': { name: 'Nederlands', flag: '🇳🇱', priority: 2 }, // Netherlands priority
      'de-DE': { name: 'Deutsch', flag: '🇩🇪', priority: 3 },   // Germany priority
      'es-ES': { name: 'Español', flag: '🇪🇸', priority: 4 },
      'pt-PT': { name: 'Português', flag: '🇵🇹', priority: 5 },
      'fr-FR': { name: 'Français', flag: '🇫🇷', priority: 6 },
      'en-IE': { name: 'English (Ireland)', flag: '🇮🇪', priority: 7 }
    };
    
    this.init();
  }
  
  async init() {
    // Load translations for current language
    await this.loadTranslations();
    
    // Initialize UI
    this.initializeUI();
    
    // Start consultation session
    await this.startConsultation();
  }
  
  async loadTranslations() {
    try {
      const response = await fetch(`${this.i18nServiceUrl}/api/translations?language=${this.language}&tenantId=${this.tenantId}`);
      const data = await response.json();
      
      if (data.success) {
        this.translations = data.translations;
      } else {
        console.warn('Failed to load translations, using defaults');
        this.translations = this.getDefaultTranslations();
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      this.translations = this.getDefaultTranslations();
    }
  }
  
  getDefaultTranslations() {
    const defaults = {
      'en-US': {
        'consultation.title': 'Eyewear Consultation',
        'consultation.welcome': 'Welcome! I\'m here to help you find the perfect eyewear.',
        'consultation.placeholder': 'Type your message...',
        'consultation.upload': 'Upload Photo',
        'consultation.send': 'Send',
        'consultation.language': 'Language',
        'consultation.connecting': 'Connecting...',
        'consultation.error': 'Connection error. Please try again.',
        'consultation.upload.analyzing': 'Analyzing your photo...',
        'consultation.recommendations': 'Based on your face analysis, here are my recommendations:'
      },
      'nl-NL': {
        'consultation.title': 'Brillenconsultatie',
        'consultation.welcome': 'Welkom! Ik help je graag bij het vinden van de perfecte bril.',
        'consultation.placeholder': 'Typ je bericht...',
        'consultation.upload': 'Foto Uploaden',
        'consultation.send': 'Versturen',
        'consultation.language': 'Taal',
        'consultation.connecting': 'Verbinding maken...',
        'consultation.error': 'Verbindingsfout. Probeer het opnieuw.',
        'consultation.upload.analyzing': 'Je foto analyseren...',
        'consultation.recommendations': 'Gebaseerd op je gezichtsanalyse, hier zijn mijn aanbevelingen:'
      },
      'de-DE': {
        'consultation.title': 'Brillenberatung',
        'consultation.welcome': 'Willkommen! Ich helfe Ihnen gerne dabei, die perfekte Brille zu finden.',
        'consultation.placeholder': 'Nachricht eingeben...',
        'consultation.upload': 'Foto Hochladen',
        'consultation.send': 'Senden',
        'consultation.language': 'Sprache',
        'consultation.connecting': 'Verbindung wird hergestellt...',
        'consultation.error': 'Verbindungsfehler. Bitte versuchen Sie es erneut.',
        'consultation.upload.analyzing': 'Ihr Foto wird analysiert...',
        'consultation.recommendations': 'Basierend auf Ihrer Gesichtsanalyse, hier sind meine Empfehlungen:'
      },
      'es-ES': {
        'consultation.title': 'Consulta de Gafas',
        'consultation.welcome': '¡Bienvenido! Estoy aquí para ayudarte a encontrar las gafas perfectas.',
        'consultation.placeholder': 'Escribe tu mensaje...',
        'consultation.upload': 'Subir Foto',
        'consultation.send': 'Enviar',
        'consultation.language': 'Idioma',
        'consultation.connecting': 'Conectando...',
        'consultation.error': 'Error de conexión. Inténtalo de nuevo.',
        'consultation.upload.analyzing': 'Analizando tu foto...',
        'consultation.recommendations': 'Basado en tu análisis facial, aquí están mis recomendaciones:'
      },
      'pt-PT': {
        'consultation.title': 'Consulta de Óculos',
        'consultation.welcome': 'Bem-vindo! Estou aqui para ajudá-lo a encontrar os óculos perfeitos.',
        'consultation.placeholder': 'Digite sua mensagem...',
        'consultation.upload': 'Carregar Foto',
        'consultation.send': 'Enviar',
        'consultation.language': 'Idioma',
        'consultation.connecting': 'Conectando...',
        'consultation.error': 'Erro de conexão. Tente novamente.',
        'consultation.upload.analyzing': 'Analisando sua foto...',
        'consultation.recommendations': 'Com base na sua análise facial, aqui estão minhas recomendações:'
      },
      'fr-FR': {
        'consultation.title': 'Consultation Lunettes',
        'consultation.welcome': 'Bienvenue ! Je suis là pour vous aider à trouver les lunettes parfaites.',
        'consultation.placeholder': 'Tapez votre message...',
        'consultation.upload': 'Télécharger Photo',
        'consultation.send': 'Envoyer',
        'consultation.language': 'Langue',
        'consultation.connecting': 'Connexion...',
        'consultation.error': 'Erreur de connexion. Veuillez réessayer.',
        'consultation.upload.analyzing': 'Analyse de votre photo...',
        'consultation.recommendations': 'Basé sur votre analyse faciale, voici mes recommandations:'
      },
      'en-IE': {
        'consultation.title': 'Spectacles Consultation',
        'consultation.welcome': 'Welcome! I\'m here to help you find the perfect spectacles.',
        'consultation.placeholder': 'Type your message...',
        'consultation.upload': 'Upload Photo',
        'consultation.send': 'Send',
        'consultation.language': 'Language',
        'consultation.connecting': 'Connecting...',
        'consultation.error': 'Connection error. Please try again.',
        'consultation.upload.analyzing': 'Analysing your photo...',
        'consultation.recommendations': 'Based on your face analysis, here are my recommendations:'
      }
    };
    
    return defaults[this.language] || defaults['en-US'];
  }
  
  translate(key, variables = {}) {
    let translation = this.translations[key] || key;
    
    // Simple variable substitution
    Object.entries(variables).forEach(([varKey, value]) => {
      translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), value);
    });
    
    return translation;
  }
  
  initializeUI() {
    const container = document.getElementById('consultation-container');
    if (!container) {
      console.error('Consultation container not found');
      return;
    }
    
    container.innerHTML = `
      <div class="consultation-header">
        <h2>${this.translate('consultation.title')}</h2>
        <div class="language-selector">
          <select id="language-select">
            ${Object.entries(this.supportedLanguages)
              .sort((a, b) => a[1].priority - b[1].priority)
              .map(([code, info]) => `
                <option value="${code}" ${code === this.language ? 'selected' : ''}>
                  ${info.flag} ${info.name}
                </option>
              `).join('')}
          </select>
        </div>
      </div>
      
      <div class="consultation-chat" id="consultation-chat">
        <div class="message assistant-message">
          ${this.translate('consultation.welcome')}
        </div>
        <div class="connection-status" id="connection-status">
          ${this.translate('consultation.connecting')}
        </div>
      </div>
      
      <div class="consultation-input">
        <div class="image-upload">
          <input type="file" id="image-upload" accept="image/*" style="display: none;">
          <button id="upload-btn" class="upload-btn">
            📷 ${this.translate('consultation.upload')}
          </button>
        </div>
        <div class="text-input">
          <input 
            type="text" 
            id="message-input" 
            placeholder="${this.translate('consultation.placeholder')}"
            maxlength="500"
          >
          <button id="send-btn" class="send-btn">
            ${this.translate('consultation.send')}
          </button>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Language selector
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', (e) => {
      this.switchLanguage(e.target.value);
    });
    
    // Image upload
    const uploadBtn = document.getElementById('upload-btn');
    const imageUpload = document.getElementById('image-upload');
    
    uploadBtn.addEventListener('click', () => {
      imageUpload.click();
    });
    
    imageUpload.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageUpload(e.target.files[0]);
      }
    });
    
    // Text input
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Typing indicators
    let typingTimer;
    messageInput.addEventListener('input', () => {
      if (this.socket && this.isConnected) {
        this.socket.emit('typing_start');
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          this.socket.emit('typing_stop');
        }, 1000);
      }
    });
  }
  
  async startConsultation() {
    try {
      // Start consultation via API
      const response = await fetch(`${this.consultationServiceUrl}/api/consultation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
          'X-User-ID': this.userId
        },
        body: JSON.stringify({
          tenantId: this.tenantId,
          userId: this.userId,
          language: this.language
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.consultationId = data.consultationId;
        this.connectSocket();
      } else {
        this.showError(this.translate('consultation.error'));
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      this.showError(this.translate('consultation.error'));
    }
  }
  
  connectSocket() {
    if (!this.consultationId) return;
    
    // Connect to Socket.IO
    this.socket = io(this.consultationServiceUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to consultation service');
      this.isConnected = true;
      this.hideConnectionStatus();
      
      // Join consultation room
      this.socket.emit('join_consultation', {
        consultationId: this.consultationId,
        tenantId: this.tenantId,
        userId: this.userId,
        language: this.language
      });
    });
    
    this.socket.on('joined_consultation', (data) => {
      console.log('Joined consultation:', data);
      this.addMessage(data.welcomeMessage, 'assistant');
    });
    
    this.socket.on('message_response', (data) => {
      this.addMessage(data.response, 'assistant');
    });
    
    this.socket.on('image_analysis_result', (data) => {
      this.addMessage(data.response, 'assistant');
    });
    
    this.socket.on('processing_image', (data) => {
      this.addMessage(data.message, 'system');
    });
    
    this.socket.on('language_switched', (data) => {
      this.addMessage(data.message, 'system');
      this.reloadUI();
    });
    
    this.socket.on('user_typing', () => {
      this.showTypingIndicator();
    });
    
    this.socket.on('user_stopped_typing', () => {
      this.hideTypingIndicator();
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.showError(error.message);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from consultation service');
      this.isConnected = false;
      this.showConnectionStatus(this.translate('consultation.connecting'));
    });
  }
  
  async switchLanguage(newLanguage) {
    if (newLanguage === this.language) return;
    
    this.language = newLanguage;
    
    // Load new translations
    await this.loadTranslations();
    
    // Switch language in consultation
    if (this.socket && this.isConnected) {
      this.socket.emit('switch_language', { language: newLanguage });
    }
    
    // Update UI
    this.reloadUI();
  }
  
  reloadUI() {
    this.initializeUI();
    if (this.socket && this.isConnected) {
      this.hideConnectionStatus();
    }
  }
  
  sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    messageInput.value = '';
    
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        message: {
          type: 'text',
          text: message
        },
        metadata: {
          timestamp: new Date().toISOString(),
          language: this.language
        }
      });
    }
  }
  
  async handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }
    
    // Show uploading message
    this.addMessage(this.translate('consultation.upload.analyzing'), 'system');
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      if (this.socket && this.isConnected) {
        this.socket.emit('upload_image', {
          imageData,
          format: file.type.split('/')[1],
          quality: 0.8
        });
      }
    };
    
    reader.readAsDataURL(file);
  }
  
  addMessage(content, type) {
    const chatContainer = document.getElementById('consultation-chat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = content;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  showConnectionStatus(message) {
    const statusDiv = document.getElementById('connection-status');
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.style.display = 'block';
    }
  }
  
  hideConnectionStatus() {
    const statusDiv = document.getElementById('connection-status');
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
  }
  
  showError(message) {
    this.addMessage(message, 'error');
  }
  
  showTypingIndicator() {
    const chatContainer = document.getElementById('consultation-chat');
    const existingIndicator = document.getElementById('typing-indicator');
    
    if (!existingIndicator) {
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.className = 'message typing-indicator';
      typingDiv.innerHTML = '💬 Assistant is typing...';
      chatContainer.appendChild(typingDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
  
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// Auto-detect language and initialize consultation
document.addEventListener('DOMContentLoaded', () => {
  // Get language from URL, browser, or default to Dutch (Netherlands priority)
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get('lang') || 
                   navigator.language.replace('-', '-') || 
                   'nl-NL'; // Default to Dutch for Netherlands market priority
  
  const tenantId = urlParams.get('tenant') || 'brillen-amsterdam';
  const userId = urlParams.get('user') || `user-${Date.now()}`;
  
  // Initialize multi-language consultation
  window.consultation = new MultiLanguageConsultation({
    tenantId,
    userId,
    language
  });
});