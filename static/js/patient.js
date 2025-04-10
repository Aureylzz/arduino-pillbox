/**
 * Patient Dashboard Manager
 * Handles patient-specific functionality
 */
class PatientManager {
    constructor() {
        // DOM Elements - Tabs
        this.medicationsTab = document.getElementById('medications-tab');
        this.messagesTab = document.getElementById('messages-tab');
        this.medicationsPanel = document.getElementById('medications-panel');
        this.messagesPanel = document.getElementById('messages-panel');
        
        // DOM Elements - Prescriptions
        this.prescriptionList = document.getElementById('patient-prescription-list');
        
        // DOM Elements - Messages
        this.messageList = document.getElementById('patient-message-list');
        this.conversation = document.getElementById('patient-conversation');
        this.conversationRecipient = document.getElementById('conversation-recipient');
        this.messageContainer = document.getElementById('message-container');
        this.messageInput = document.getElementById('message-input');
        this.sendMessageButton = document.getElementById('send-message');
        this.backToMessageList = document.getElementById('back-to-message-list');
        
        // State
        this.prescriptions = [];
        this.doctors = [];
        this.currentConversationUserId = null;
        
        // Bind events
        this.bindEvents();
    }
    
    /**
     * Bind event handlers to DOM elements
     */
    bindEvents() {
        // Tab navigation
        this.medicationsTab.addEventListener('click', () => this.switchTab('medications'));
        this.messagesTab.addEventListener('click', () => this.switchTab('messages'));
        
        // Message handling
        this.sendMessageButton.addEventListener('click', () => this.sendMessage());
        this.backToMessageList.addEventListener('click', () => this.showMessageList());
        
        // Message input - send on Enter, new line on Shift+Enter
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    /**
     * Switch between tabs
     * @param {string} tab - Tab name to switch to
     */
    switchTab(tab) {
        // Update tab buttons
        this.medicationsTab.classList.toggle('active', tab === 'medications');
        this.messagesTab.classList.toggle('active', tab === 'messages');
        
        // Update tab panels
        this.medicationsPanel.classList.toggle('active', tab === 'medications');
        this.messagesPanel.classList.toggle('active', tab === 'messages');
        
        // Load data if switching to messages tab
        if (tab === 'messages') {
            this.loadDoctors();
        }
    }
    
    /**
     * Load all data for the patient dashboard
     */
    async loadData() {
        await this.loadPrescriptions();
    }
    
    /**
     * Load prescriptions for the current patient
     */
    async loadPrescriptions() {
        try {
            const response = await ApiService.getPrescriptions();
            
            if (response.success) {
                this.prescriptions = response.prescriptions;
                this.renderPrescriptions();
            }
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    }
    
    /**
     * Render prescriptions in the UI
     */
    renderPrescriptions() {
        this.prescriptionList.innerHTML = '';
        
        if (this.prescriptions.length === 0) {
            this.prescriptionList.innerHTML = '<p>Aucune prescription active.</p>';
            return;
        }
        
        // Group prescriptions by motor number
        const motorGroups = {};
        this.prescriptions.forEach(prescription => {
            const motorNumber = prescription.motor_number;
            if (!motorGroups[motorNumber]) {
                motorGroups[motorNumber] = [];
            }
            motorGroups[motorNumber].push(prescription);
        });
        
        // Create cards for each motor
        Object.entries(motorGroups).forEach(([motorNumber, prescriptions]) => {
            const card = document.createElement('div');
            card.className = 'prescription-card';
            
            const header = document.createElement('div');
            header.className = 'prescription-header';
            
            const title = document.createElement('div');
            title.className = 'prescription-title';
            title.textContent = `Compartiment ${motorNumber}`;
            
            header.appendChild(title);
            card.appendChild(header);
            
            const details = document.createElement('div');
            details.className = 'prescription-details';
            
            prescriptions.forEach(prescription => {
                const detail = document.createElement('div');
                detail.className = 'prescription-detail';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = prescription.medication_name;
                
                const infoSpan = document.createElement('span');
                infoSpan.textContent = `${prescription.medication_dosage} - ${prescription.intake_time}`;
                
                detail.appendChild(nameSpan);
                detail.appendChild(infoSpan);
                details.appendChild(detail);
            });
            
            card.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'prescription-actions';
            
            const openButton = document.createElement('button');
            openButton.textContent = 'Ouvrir';
            openButton.addEventListener('click', () => this.controlPillbox(motorNumber, 'open'));
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Fermer';
            closeButton.addEventListener('click', () => this.controlPillbox(motorNumber, 'close'));
            
            actions.appendChild(openButton);
            actions.appendChild(closeButton);
            card.appendChild(actions);
            
            this.prescriptionList.appendChild(card);
        });
    }
    
    /**
     * Control a pillbox compartment
     * @param {number} motorNumber - Motor number to control
     * @param {string} action - Action to perform ('open' or 'close')
     */
    async controlPillbox(motorNumber, action) {
        try {
            const response = await ApiService.controlPillbox(motorNumber, action);
            
            if (response.success) {
                alert(`Le compartiment ${motorNumber} a été ${action === 'open' ? 'ouvert' : 'fermé'} avec succès.`);
            } else {
                alert(`Erreur lors du contrôle du compartiment ${motorNumber}.`);
            }
        } catch (error) {
            console.error('Pillbox control error:', error);
            alert('Une erreur est survenue lors du contrôle du pilulier.');
        }
    }
    
    /**
     * Load doctors for messaging
     */
    async loadDoctors() {
        try {
            const response = await ApiService.getUsers(true);
            
            if (response.success) {
                this.doctors = response.users;
                this.renderMessageList();
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    }
    
    /**
     * Render message contacts in the UI
     */
    renderMessageList() {
        this.messageList.innerHTML = '';
        
        if (this.doctors.length === 0) {
            this.messageList.innerHTML = '<p>Aucun médecin disponible.</p>';
            return;
        }
        
        this.doctors.forEach(doctor => {
            const contact = document.createElement('div');
            contact.className = 'message-contact';
            contact.dataset.userId = doctor.id;
            
            const name = document.createElement('div');
            name.className = 'message-contact-name';
            name.textContent = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            
            contact.appendChild(name);
            contact.addEventListener('click', () => this.showConversation(doctor.id, `Dr. ${doctor.first_name} ${doctor.last_name}`));
            
            this.messageList.appendChild(contact);
        });
    }
    
    /**
     * Show conversation with a specific user
     * @param {number} userId - User ID of the conversation partner
     * @param {string} userName - Name of the conversation partner
     */
    async showConversation(userId, userName) {
        this.currentConversationUserId = userId;
        this.conversationRecipient.textContent = userName;
        
        this.messageList.style.display = 'none';
        this.conversation.classList.add('active');
        
        await this.loadConversation();
    }
    
    /**
     * Show message list and hide conversation
     */
    showMessageList() {
        this.messageList.style.display = 'block';
        this.conversation.classList.remove('active');
        this.currentConversationUserId = null;
    }
    
    /**
     * Load conversation with current user
     */
    async loadConversation() {
        if (!this.currentConversationUserId) return;
        
        try {
            const response = await ApiService.getConversation(this.currentConversationUserId);
            
            if (response.success) {
                this.renderConversation(response.messages);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    }
    
    /**
     * Render conversation messages in the UI
     * @param {Array} messages - Array of message objects
     */
    renderConversation(messages) {
        this.messageContainer.innerHTML = '';
        
        if (messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-conversation';
            emptyMessage.textContent = 'Aucun message. Commencez la conversation!';
            this.messageContainer.appendChild(emptyMessage);
            return;
        }
        
        const currentUser = window.authManager.getCurrentUser();
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = message.sender_id === currentUser.id ? 'message sent' : 'message received';
            
            const content = document.createElement('div');
            content.className = 'message-content';
            content.textContent = message.content;
            
            const timestamp = document.createElement('div');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = new Date(message.created_at).toLocaleString();
            
            messageElement.appendChild(content);
            messageElement.appendChild(timestamp);
            
            this.messageContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    
    /**
     * Send a message in the current conversation
     */
    async sendMessage() {
        const content = this.messageInput.value.trim();
        
        if (!content || !this.currentConversationUserId) {
            return;
        }
        
        try {
            const response = await ApiService.sendMessage(this.currentConversationUserId, content);
            
            if (response.success) {
                this.messageInput.value = '';
                await this.loadConversation();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
    }
}