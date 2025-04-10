/**
 * Doctor Dashboard Manager
 * Handles doctor-specific functionality
 */
class DoctorManager {
    constructor() {
        // DOM Elements - Tabs
        this.prescriptionsTab = document.getElementById('prescriptions-tab');
        this.medicationsTab = document.getElementById('doc-medications-tab');
        this.messagesTab = document.getElementById('doc-messages-tab');
        this.prescriptionsPanel = document.getElementById('prescriptions-panel');
        this.medicationsPanel = document.getElementById('doc-medications-panel');
        this.messagesPanel = document.getElementById('doc-messages-panel');
        
        // DOM Elements - Prescriptions
        this.prescriptionList = document.getElementById('doctor-prescription-list');
        this.addPrescriptionButton = document.getElementById('add-prescription');
        
        // DOM Elements - Medications
        this.medicationList = document.getElementById('medication-list');
        this.addMedicationButton = document.getElementById('add-medication');
        
        // DOM Elements - Messages
        this.messageList = document.getElementById('doctor-message-list');
        this.conversation = document.getElementById('doctor-conversation');
        this.conversationRecipient = document.getElementById('doctor-conversation-recipient');
        this.messageContainer = document.getElementById('doctor-message-container');
        this.messageInput = document.getElementById('doctor-message-input');
        this.sendMessageButton = document.getElementById('doctor-send-message');
        this.backToMessageList = document.getElementById('back-to-doctor-message-list');
        
        // DOM Elements - Modals
        this.medicationModal = document.getElementById('medication-modal');
        this.closeMedicationModal = document.getElementById('close-medication-modal');
        this.medicationNameInput = document.getElementById('medication-name');
        this.medicationDosageInput = document.getElementById('medication-dosage');
        this.saveMedicationButton = document.getElementById('save-medication');
        
        this.prescriptionModal = document.getElementById('prescription-modal');
        this.closePrescriptionModal = document.getElementById('close-prescription-modal');
        this.prescriptionPatientSelect = document.getElementById('prescription-patient');
        this.prescriptionMedicationSelect = document.getElementById('prescription-medication');
        this.prescriptionMotorSelect = document.getElementById('prescription-motor');
        this.prescriptionTimeInput = document.getElementById('prescription-time');
        this.savePrescriptionButton = document.getElementById('save-prescription');
        
        // State
        this.prescriptions = [];
        this.medications = [];
        this.patients = [];
        this.currentConversationUserId = null;
        
        // Bind events
        this.bindEvents();
    }
    
    /**
     * Bind event handlers to DOM elements
     */
    bindEvents() {
        // Tab navigation
        this.prescriptionsTab.addEventListener('click', () => this.switchTab('prescriptions'));
        this.medicationsTab.addEventListener('click', () => this.switchTab('medications'));
        this.messagesTab.addEventListener('click', () => this.switchTab('messages'));
        
        // Add buttons
        this.addMedicationButton.addEventListener('click', () => this.showMedicationModal());
        this.addPrescriptionButton.addEventListener('click', () => this.showPrescriptionModal());
        
        // Modal close buttons
        this.closeMedicationModal.addEventListener('click', () => this.hideMedicationModal());
        this.closePrescriptionModal.addEventListener('click', () => this.hidePrescriptionModal());
        
        // Modal save buttons
        this.saveMedicationButton.addEventListener('click', () => this.saveMedication());
        this.savePrescriptionButton.addEventListener('click', () => this.savePrescription());
        
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
        this.prescriptionsTab.classList.toggle('active', tab === 'prescriptions');
        this.medicationsTab.classList.toggle('active', tab === 'medications');
        this.messagesTab.classList.toggle('active', tab === 'messages');
        
        // Update tab panels
        this.prescriptionsPanel.classList.toggle('active', tab === 'prescriptions');
        this.medicationsPanel.classList.toggle('active', tab === 'medications');
        this.messagesPanel.classList.toggle('active', tab === 'messages');
        
        // Load data if switching to messages tab
        if (tab === 'messages') {
            this.loadPatients();
        }
    }
    
    /**
     * Load all data for the doctor dashboard
     */
    async loadData() {
        await Promise.all([
            this.loadPrescriptions(),
            this.loadMedications(),
            this.loadPatients()
        ]);
    }
    
    /**
     * Load prescriptions created by the current doctor
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
     * Load medications
     */
    async loadMedications() {
        try {
            const response = await ApiService.getMedications();
            
            if (response.success) {
                this.medications = response.medications;
                this.renderMedications();
            }
        } catch (error) {
            console.error('Error loading medications:', error);
        }
    }
    
    /**
     * Load patients for prescriptions and messaging
     */
    async loadPatients() {
        try {
            const response = await ApiService.getUsers(false);
            
            if (response.success) {
                this.patients = response.users;
                this.renderMessageList();
                
                // Update the patient select in the prescription modal
                this.populatePrescriptionModal();
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }
    
    /**
     * Render prescriptions in the UI
     */
    renderPrescriptions() {
        this.prescriptionList.innerHTML = '';
        
        if (this.prescriptions.length === 0) {
            this.prescriptionList.innerHTML = '<p>Aucune prescription.</p>';
            return;
        }
        
        this.prescriptions.forEach(prescription => {
            const card = document.createElement('div');
            card.className = 'prescription-card';
            card.dataset.prescriptionId = prescription.id;
            
            const header = document.createElement('div');
            header.className = 'prescription-header';
            
            const title = document.createElement('div');
            title.className = 'prescription-title';
            title.textContent = prescription.patient_name;
            
            const status = document.createElement('div');
            status.className = 'prescription-status';
            status.textContent = prescription.active ? 'Actif' : 'Inactif';
            status.style.color = prescription.active ? 'var(--success-color)' : 'var(--error-color)';
            
            header.appendChild(title);
            header.appendChild(status);
            card.appendChild(header);
            
            const details = document.createElement('div');
            details.className = 'prescription-details';
            
            const medicationDetail = document.createElement('div');
            medicationDetail.className = 'prescription-detail';
            medicationDetail.innerHTML = `<span>Médicament:</span><span>${prescription.medication_name} (${prescription.medication_dosage})</span>`;
            
            const compartmentDetail = document.createElement('div');
            compartmentDetail.className = 'prescription-detail';
            compartmentDetail.innerHTML = `<span>Compartiment:</span><span>${prescription.motor_number}</span>`;
            
            const timeDetail = document.createElement('div');
            timeDetail.className = 'prescription-detail';
            timeDetail.innerHTML = `<span>Heure:</span><span>${prescription.intake_time}</span>`;
            
            details.appendChild(medicationDetail);
            details.appendChild(compartmentDetail);
            details.appendChild(timeDetail);
            card.appendChild(details);
            
            if (prescription.active) {
                const actions = document.createElement('div');
                actions.className = 'prescription-actions';
                
                const deactivateButton = document.createElement('button');
                deactivateButton.className = 'deactivate';
                deactivateButton.textContent = 'Désactiver';
                deactivateButton.addEventListener('click', () => this.deactivatePrescription(prescription.id));
                
                actions.appendChild(deactivateButton);
                card.appendChild(actions);
            }
            
            this.prescriptionList.appendChild(card);
        });
    }
    
    /**
     * Render medications in the UI
     */
    renderMedications() {
        this.medicationList.innerHTML = '';
        
        if (this.medications.length === 0) {
            this.medicationList.innerHTML = '<p>Aucun médicament.</p>';
            return;
        }
        
        this.medications.forEach(medication => {
            const card = document.createElement('div');
            card.className = 'medication-card';
            
            const name = document.createElement('div');
            name.className = 'medication-name';
            name.textContent = medication.name;
            
            const dosage = document.createElement('div');
            dosage.className = 'medication-dosage';
            dosage.textContent = medication.dosage;
            
            card.appendChild(name);
            card.appendChild(dosage);
            
            this.medicationList.appendChild(card);
        });
    }
    
    /**
     * Render message contacts in the UI
     */
    renderMessageList() {
        this.messageList.innerHTML = '';
        
        if (this.patients.length === 0) {
            this.messageList.innerHTML = '<p>Aucun patient.</p>';
            return;
        }
        
        this.patients.forEach(patient => {
            const contact = document.createElement('div');
            contact.className = 'message-contact';
            contact.dataset.userId = patient.id;
            
            const name = document.createElement('div');
            name.className = 'message-contact-name';
            name.textContent = `${patient.first_name} ${patient.last_name}`;
            
            contact.appendChild(name);
            contact.addEventListener('click', () => this.showConversation(patient.id, `${patient.first_name} ${patient.last_name}`));
            
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
    
    /**
     * Show medication modal for adding a new medication
     */
    showMedicationModal() {
        // Clear input fields
        this.medicationNameInput.value = '';
        this.medicationDosageInput.value = '';
        
        // Show modal
        this.medicationModal.classList.add('active');
    }
    
    /**
     * Hide medication modal
     */
    hideMedicationModal() {
        this.medicationModal.classList.remove('active');
    }
    
    /**
     * Save new medication
     */
    async saveMedication() {
        const name = this.medicationNameInput.value.trim();
        const dosage = this.medicationDosageInput.value.trim();
        
        if (!name || !dosage) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            const response = await ApiService.createMedication(name, dosage);
            
            if (response.success) {
                // Hide modal
                this.hideMedicationModal();
                
                // Reload medications
                await this.loadMedications();
            }
        } catch (error) {
            console.error('Error saving medication:', error);
            alert('Erreur lors de l\'enregistrement du médicament. Veuillez réessayer.');
        }
    }
    
    /**
     * Show prescription modal for adding a new prescription
     */
    showPrescriptionModal() {
        // Reset form
        this.prescriptionTimeInput.value = '';
        
        // Populate select fields
        this.populatePrescriptionModal();
        
        // Show modal
        this.prescriptionModal.classList.add('active');
    }
    
    /**
     * Hide prescription modal
     */
    hidePrescriptionModal() {
        this.prescriptionModal.classList.remove('active');
    }
    
    /**
     * Populate prescription modal with patients and medications
     */
    populatePrescriptionModal() {
        // Clear existing options
        this.prescriptionPatientSelect.innerHTML = '';
        this.prescriptionMedicationSelect.innerHTML = '';
        
        // Add patients
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.first_name} ${patient.last_name}`;
            this.prescriptionPatientSelect.appendChild(option);
        });
        
        // Add medications
        this.medications.forEach(medication => {
            const option = document.createElement('option');
            option.value = medication.id;
            option.textContent = `${medication.name} (${medication.dosage})`;
            this.prescriptionMedicationSelect.appendChild(option);
        });
    }
    
    /**
     * Save new prescription
     */
    async savePrescription() {
        const patientId = this.prescriptionPatientSelect.value;
        const medicationId = this.prescriptionMedicationSelect.value;
        const motorNumber = this.prescriptionMotorSelect.value;
        const intakeTime = this.prescriptionTimeInput.value;
        
        if (!patientId || !medicationId || !motorNumber || !intakeTime) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            const response = await ApiService.createPrescription(patientId, medicationId, motorNumber, intakeTime);
            
            if (response.success) {
                // Hide modal
                this.hidePrescriptionModal();
                
                // Reload prescriptions
                await this.loadPrescriptions();
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            alert('Erreur lors de l\'enregistrement de la prescription. Veuillez réessayer.');
        }
    }
    
    /**
     * Deactivate a prescription
     * @param {number} prescriptionId - ID of the prescription to deactivate
     */
    async deactivatePrescription(prescriptionId) {
        if (confirm('Êtes-vous sûr de vouloir désactiver cette prescription?')) {
            try {
                const response = await ApiService.deactivatePrescription(prescriptionId);
                
                if (response.success) {
                    await this.loadPrescriptions();
                }
            } catch (error) {
                console.error('Error deactivating prescription:', error);
                alert('Erreur lors de la désactivation de la prescription. Veuillez réessayer.');
            }
        }
    }
}