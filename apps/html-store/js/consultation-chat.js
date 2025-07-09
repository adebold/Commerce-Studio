class ConsultationChat {
    constructor(options = {}) {
        this.options = options;
        this.container = null;
        this.chatWindow = null;
        this.messagesContainer = null;
        this.input = null;
        this.isOpen = false;
        this.sessionId = null;

        this.init();
    }

    init() {
        this.createContainer();
        this.createChatBubble();
        this.createChatWindow();
        this.addEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'consultation-chat-container';
        document.body.appendChild(this.container);
    }

    createChatBubble() {
        const bubble = document.createElement('div');
        bubble.id = 'chat-bubble';
        bubble.innerHTML = '💬';
        this.container.appendChild(bubble);
    }

    createChatWindow() {
        this.chatWindow = document.createElement('div');
        this.chatWindow.id = 'chat-window';
        this.chatWindow.style.display = 'none';

        const header = document.createElement('div');
        header.id = 'chat-header';
        header.innerHTML = '<h3>AI Eyewear Consultant</h3>';
        this.chatWindow.appendChild(header);

        this.messagesContainer = document.createElement('div');
        this.messagesContainer.id = 'chat-messages';
        this.chatWindow.appendChild(this.messagesContainer);

        const inputContainer = document.createElement('div');
        inputContainer.id = 'chat-input-container';
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Type your message...';
        const sendButton = document.createElement('button');
        sendButton.innerHTML = 'Send';
        inputContainer.appendChild(this.input);
        inputContainer.appendChild(sendButton);
        this.chatWindow.appendChild(inputContainer);

        this.container.appendChild(this.chatWindow);
    }

    addEventListeners() {
        const bubble = document.getElementById('chat-bubble');
        bubble.addEventListener('click', () => this.toggleChat());

        const sendButton = this.chatWindow.querySelector('button');
        sendButton.addEventListener('click', () => this.sendMessage());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen && !this.sessionId) {
            this.startConsultation();
        }
    }

    async startConsultation() {
        this.addMessage('Hello! I am your personal AI eyewear consultant. How can I help you today?', 'ai');
        // In a real application, this would call the backend to start a new session
        this.sessionId = `session_${Date.now()}`;
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.input.value = '';

        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.addMessage('Sorry, I am having trouble connecting. Please try again later.', 'ai');
        }
    }

    addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        messageElement.innerHTML = `<p>${text}</p>`;
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async getAIResponse(message) {
        const webhookUrl = this.options.apiBaseUrl ? `${this.options.apiBaseUrl}/webhook` : '/webhook';
        
        // Construct the session path carefully. Assuming 'global' for location.
        const sessionPath = `projects/${this.options.dialogflowProjectId}/locations/global/agents/${this.options.dialogflowAgentId}/sessions/${this.sessionId}`;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionInfo: {
                    session: sessionPath,
                },
                queryInput: {
                    text: {
                        text: message,
                    },
                    languageCode: 'en',
                },
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Extract text from the response messages
        if (data.fulfillmentResponse && data.fulfillmentResponse.messages) {
            return data.fulfillmentResponse.messages.map(m => m.text.text.join(' ')).join('\n');
        }
        
        return 'Sorry, I could not understand that.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ConsultationChat();
});