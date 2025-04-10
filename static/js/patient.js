/**
 * Gestionnaire du tableau de bord patient
 * Gère les fonctionnalités spécifiques aux patients
 */
class PatientManager {
    constructor() {
        console.log("Initialisation du gestionnaire patient");
        
        // Éléments DOM - Onglets
        this.medicationsTab = document.getElementById('medications-tab');
        this.messagesTab = document.getElementById('messages-tab');
        this.medicationsPanel = document.getElementById('medications-panel');
        this.messagesPanel = document.getElementById('messages-panel');
        
        // Éléments DOM - Prescriptions
        this.prescriptionList = document.getElementById('patient-prescription-list');
        
        // Éléments DOM - Messages
        this.messageList = document.getElementById('patient-message-list');
        this.conversation = document.getElementById('patient-conversation');
        this.conversationRecipient = document.getElementById('conversation-recipient');
        this.messageContainer = document.getElementById('message-container');
        this.messageInput = document.getElementById('message-input');
        this.sendMessageButton = document.getElementById('send-message');
        this.backToMessageList = document.getElementById('back-to-message-list');
        
        // État
        this.prescriptions = [];
        this.doctors = [];
        this.currentConversationUserId = null;
        
        // Vérifie si tous les éléments DOM sont présents
        console.log("Éléments du tableau de bord patient:", {
            medicationsTab: this.medicationsTab,
            messagesTab: this.messagesTab,
            medicationsPanel: this.medicationsPanel,
            messagesPanel: this.messagesPanel,
            prescriptionList: this.prescriptionList,
            messageList: this.messageList,
            conversation: this.conversation,
            messageInput: this.messageInput
        });
        
        // Associer les gestionnaires d'événements
        this.bindEvents();
    }
    
    /**
     * Associer les gestionnaires d'événements aux éléments DOM
     */
    bindEvents() {
        console.log("Attachement des événements du tableau de bord patient");
        
        // Navigation par onglets
        if (this.medicationsTab) {
            this.medicationsTab.addEventListener('click', () => {
                console.log("Onglet Médicaments cliqué");
                this.switchTab('medications');
            });
        }
        
        if (this.messagesTab) {
            this.messagesTab.addEventListener('click', () => {
                console.log("Onglet Messages cliqué");
                this.switchTab('messages');
            });
        }
        
        // Gestion des messages
        if (this.sendMessageButton) {
            this.sendMessageButton.addEventListener('click', () => {
                console.log("Bouton d'envoi de message cliqué");
                this.sendMessage();
            });
        }
        
        if (this.backToMessageList) {
            this.backToMessageList.addEventListener('click', () => {
                console.log("Retour à la liste des messages");
                this.showMessageList();
            });
        }
        
        // Champ de saisie de message - envoyer avec Entrée, nouvelle ligne avec Maj+Entrée
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }
    
    /**
     * Basculer entre les onglets
     * @param {string} tab - Nom de l'onglet à afficher
     */
    switchTab(tab) {
        console.log(`Basculement vers l'onglet: ${tab}`);
        
        // Mettre à jour les boutons d'onglet
        if (this.medicationsTab && this.messagesTab) {
            this.medicationsTab.classList.toggle('active', tab === 'medications');
            this.messagesTab.classList.toggle('active', tab === 'messages');
        }
        
        // Mettre à jour les panneaux d'onglet
        if (this.medicationsPanel && this.messagesPanel) {
            this.medicationsPanel.classList.toggle('active', tab === 'medications');
            this.messagesPanel.classList.toggle('active', tab === 'messages');
            
            // Supprimer la classe hidden pour compatibilité avec les anciens styles
            this.medicationsPanel.classList.toggle('hidden', tab !== 'medications');
            this.messagesPanel.classList.toggle('hidden', tab !== 'messages');
        }
        
        // Charger les données si passage à l'onglet messages
        if (tab === 'messages') {
            this.loadDoctors();
        }
    }
    
    /**
     * Charger toutes les données pour le tableau de bord patient
     */
    async loadData() {
        console.log("Chargement des données du patient");
        await this.loadPrescriptions();
    }
    
    /**
     * Charger les prescriptions pour le patient actuel
     */
    async loadPrescriptions() {
        console.log("Chargement des prescriptions");
        
        try {
            const response = await ApiService.getPrescriptions();
            
            if (response.success) {
                console.log("Prescriptions chargées:", response.prescriptions);
                this.prescriptions = response.prescriptions;
                this.renderPrescriptions();
            } else {
                console.log("Échec du chargement des prescriptions:", response.message);
            }
        } catch (error) {
            console.error('Erreur de chargement des prescriptions:', error);
        }
    }
    
    /**
     * Afficher les prescriptions dans l'interface utilisateur
     */
    renderPrescriptions() {
        console.log("Affichage des prescriptions");
        
        if (!this.prescriptionList) {
            console.error("Élément prescriptionList introuvable");
            return;
        }
        
        this.prescriptionList.innerHTML = '';
        
        if (this.prescriptions.length === 0) {
            this.prescriptionList.innerHTML = '<p>Aucune prescription active.</p>';
            return;
        }
        
        // Regrouper les prescriptions par numéro de moteur
        const motorGroups = {};
        this.prescriptions.forEach(prescription => {
            const motorNumber = prescription.motor_number;
            if (!motorGroups[motorNumber]) {
                motorGroups[motorNumber] = [];
            }
            motorGroups[motorNumber].push(prescription);
        });
        
        // Créer des cartes pour chaque moteur
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
                nameSpan.textContent = prescription.medication_name || "Médicament";
                
                const infoSpan = document.createElement('span');
                infoSpan.textContent = `${prescription.medication_dosage || ""} - ${prescription.intake_time || ""}`;
                
                detail.appendChild(nameSpan);
                detail.appendChild(infoSpan);
                details.appendChild(detail);
            });
            
            card.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'prescription-actions';
            
            const openButton = document.createElement('button');
            openButton.textContent = 'Ouvrir';
            openButton.addEventListener('click', () => {
                console.log(`Demande d'ouverture du compartiment ${motorNumber}`);
                this.controlPillbox(motorNumber, 'open');
            });
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Fermer';
            closeButton.addEventListener('click', () => {
                console.log(`Demande de fermeture du compartiment ${motorNumber}`);
                this.controlPillbox(motorNumber, 'close');
            });
            
            actions.appendChild(openButton);
            actions.appendChild(closeButton);
            card.appendChild(actions);
            
            this.prescriptionList.appendChild(card);
        });
    }
    
    /**
     * Contrôler un compartiment du pilulier
     * @param {number} motorNumber - Numéro du moteur à contrôler
     * @param {string} action - Action à effectuer ('open' ou 'close')
     */
    async controlPillbox(motorNumber, action) {
        console.log(`Contrôle du pilulier: moteur ${motorNumber}, action ${action}`);
        
        try {
            const response = await ApiService.controlPillbox(motorNumber, action);
            
            if (response.success) {
                console.log("Contrôle du pilulier réussi");
                alert(`Le compartiment ${motorNumber} a été ${action === 'open' ? 'ouvert' : 'fermé'} avec succès.`);
            } else {
                console.log("Échec du contrôle du pilulier:", response.message);
                alert(`Erreur lors du contrôle du compartiment ${motorNumber}.`);
            }
        } catch (error) {
            console.error('Erreur de contrôle du pilulier:', error);
            alert('Une erreur est survenue lors du contrôle du pilulier.');
        }
    }
    
    /**
     * Charger les médecins pour la messagerie
     */
    async loadDoctors() {
        console.log("Chargement des médecins");
        
        try {
            const response = await ApiService.getUsers(true);
            
            if (response.success) {
                console.log("Médecins chargés:", response.users);
                this.doctors = response.users;
                this.renderMessageList();
            } else {
                console.log("Échec du chargement des médecins:", response.message);
            }
        } catch (error) {
            console.error('Erreur de chargement des médecins:', error);
        }
    }
    
    /**
     * Afficher les contacts de messagerie dans l'interface utilisateur
     */
    renderMessageList() {
        console.log("Affichage de la liste des contacts");
        
        if (!this.messageList) {
            console.error("Élément messageList introuvable");
            return;
        }
        
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
            contact.addEventListener('click', () => {
                console.log(`Conversation avec le médecin ${doctor.id} sélectionnée`);
                this.showConversation(doctor.id, `Dr. ${doctor.first_name} ${doctor.last_name}`);
            });
            
            this.messageList.appendChild(contact);
        });
    }
    
    /**
     * Afficher la conversation avec un utilisateur spécifique
     * @param {number} userId - ID de l'utilisateur de la conversation
     * @param {string} userName - Nom de l'utilisateur de la conversation
     */
    async showConversation(userId, userName) {
        console.log(`Affichage de la conversation avec: ${userName} (ID: ${userId})`);
        
        this.currentConversationUserId = userId;
        
        if (this.conversationRecipient) {
            this.conversationRecipient.textContent = userName;
        }
        
        if (this.messageList && this.conversation) {
            this.messageList.style.display = 'none';
            this.conversation.classList.add('active');
            
            // Supprimer la classe hidden pour compatibilité avec les anciens styles
            this.conversation.classList.remove('hidden');
        }
        
        await this.loadConversation();
    }
    
    /**
     * Afficher la liste des messages et masquer la conversation
     */
    showMessageList() {
        console.log("Retour à la liste des messages");
        
        if (this.messageList && this.conversation) {
            this.messageList.style.display = 'block';
            this.conversation.classList.remove('active');
            
            // Ajouter la classe hidden pour compatibilité avec les anciens styles
            this.conversation.classList.add('hidden');
        }
        
        this.currentConversationUserId = null;
    }
    
    /**
     * Charger la conversation avec l'utilisateur actuel
     */
    async loadConversation() {
        console.log("Chargement de la conversation");
        
        if (!this.currentConversationUserId) {
            console.log("Aucun utilisateur de conversation sélectionné");
            return;
        }
        
        try {
            const response = await ApiService.getConversation(this.currentConversationUserId);
            
            if (response.success) {
                console.log("Conversation chargée:", response.messages);
                this.renderConversation(response.messages);
            } else {
                console.log("Échec du chargement de la conversation:", response.message);
            }
        } catch (error) {
            console.error('Erreur de chargement de la conversation:', error);
        }
    }
    
    /**
     * Afficher les messages de la conversation dans l'interface utilisateur
     * @param {Array} messages - Tableau d'objets de message
     */
    renderConversation(messages) {
        console.log("Affichage de la conversation");
        
        if (!this.messageContainer) {
            console.error("Élément messageContainer introuvable");
            return;
        }
        
        this.messageContainer.innerHTML = '';
        
        if (messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-conversation';
            emptyMessage.textContent = 'Aucun message. Commencez la conversation!';
            this.messageContainer.appendChild(emptyMessage);
            return;
        }
        
        const currentUser = window.authManager.getCurrentUser();
        
        if (!currentUser) {
            console.error("Aucun utilisateur connecté");
            return;
        }
        
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
        
        // Faire défiler vers le bas
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    
    /**
     * Envoyer un message dans la conversation actuelle
     */
    async sendMessage() {
        console.log("Envoi d'un message");
        
        if (!this.messageInput || !this.currentConversationUserId) {
            console.error("Élément messageInput introuvable ou aucun destinataire sélectionné");
            return;
        }
        
        const content = this.messageInput.value.trim();
        
        if (!content) {
            console.log("Message vide, annulation de l'envoi");
            return;
        }
        
        try {
            console.log(`Envoi du message au destinataire ${this.currentConversationUserId}: "${content}"`);
            const response = await ApiService.sendMessage(this.currentConversationUserId, content);
            
            if (response.success) {
                console.log("Message envoyé avec succès");
                this.messageInput.value = '';
                await this.loadConversation();
            } else {
                console.log("Échec de l'envoi du message:", response.message);
            }
        } catch (error) {
            console.error('Erreur d\'envoi de message:', error);
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
    }
}