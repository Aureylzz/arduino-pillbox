/**
 * Gestionnaire du tableau de bord médecin
 * Gère les fonctionnalités spécifiques aux médecins
 */
class DoctorManager {
    constructor() {
        console.log("Initialisation du gestionnaire médecin");
        
        // Éléments DOM - Onglets
        this.prescriptionsTab = document.getElementById('prescriptions-tab');
        this.medicationsTab = document.getElementById('doc-medications-tab');
        this.messagesTab = document.getElementById('doc-messages-tab');
        this.prescriptionsPanel = document.getElementById('prescriptions-panel');
        this.medicationsPanel = document.getElementById('doc-medications-panel');
        this.messagesPanel = document.getElementById('doc-messages-panel');
        
        // Éléments DOM - Prescriptions
        this.prescriptionList = document.getElementById('doctor-prescription-list');
        this.addPrescriptionButton = document.getElementById('add-prescription');
        
        // Éléments DOM - Médicaments
        this.medicationList = document.getElementById('medication-list');
        this.addMedicationButton = document.getElementById('add-medication');
        
        // Éléments DOM - Messages
        this.messageList = document.getElementById('doctor-message-list');
        this.conversation = document.getElementById('doctor-conversation');
        this.conversationRecipient = document.getElementById('doctor-conversation-recipient');
        this.messageContainer = document.getElementById('doctor-message-container');
        this.messageInput = document.getElementById('doctor-message-input');
        this.sendMessageButton = document.getElementById('doctor-send-message');
        this.backToMessageList = document.getElementById('back-to-doctor-message-list');
        
        // Éléments DOM - Modales
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
        
        // État
        this.prescriptions = [];
        this.medications = [];
        this.patients = [];
        this.currentConversationUserId = null;
        
        // Vérification des éléments DOM
        console.log("Éléments du tableau de bord médecin:", {
            prescriptionsTab: this.prescriptionsTab,
            medicationsTab: this.medicationsTab,
            messagesTab: this.messagesTab,
            addPrescriptionButton: this.addPrescriptionButton,
            addMedicationButton: this.addMedicationButton,
            medicationModal: this.medicationModal,
            prescriptionModal: this.prescriptionModal
        });
        
        // Associer les gestionnaires d'événements
        this.bindEvents();
    }
    
    /**
     * Associer les gestionnaires d'événements aux éléments DOM
     */
    bindEvents() {
        console.log("Attachement des événements du tableau de bord médecin");
        
        // Navigation par onglets
        if (this.prescriptionsTab) {
            this.prescriptionsTab.addEventListener('click', () => {
                console.log("Onglet Prescriptions cliqué");
                this.switchTab('prescriptions');
            });
        }
        
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
        
        // Boutons d'ajout
        if (this.addMedicationButton) {
            this.addMedicationButton.addEventListener('click', () => {
                console.log("Bouton Ajouter un médicament cliqué");
                this.showMedicationModal();
            });
        }
        
        if (this.addPrescriptionButton) {
            this.addPrescriptionButton.addEventListener('click', () => {
                console.log("Bouton Ajouter une prescription cliqué");
                this.showPrescriptionModal();
            });
        }
        
        // Boutons de fermeture des modales
        if (this.closeMedicationModal) {
            this.closeMedicationModal.addEventListener('click', () => {
                console.log("Fermeture de la modale Médicament");
                this.hideMedicationModal();
            });
        }
        
        if (this.closePrescriptionModal) {
            this.closePrescriptionModal.addEventListener('click', () => {
                console.log("Fermeture de la modale Prescription");
                this.hidePrescriptionModal();
            });
        }
        
        // Boutons de sauvegarde des modales
        if (this.saveMedicationButton) {
            this.saveMedicationButton.addEventListener('click', () => {
                console.log("Sauvegarde du médicament");
                this.saveMedication();
            });
        }
        
        if (this.savePrescriptionButton) {
            this.savePrescriptionButton.addEventListener('click', () => {
                console.log("Sauvegarde de la prescription");
                this.savePrescription();
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
        if (this.prescriptionsTab && this.medicationsTab && this.messagesTab) {
            this.prescriptionsTab.classList.toggle('active', tab === 'prescriptions');
            this.medicationsTab.classList.toggle('active', tab === 'medications');
            this.messagesTab.classList.toggle('active', tab === 'messages');
        }
        
        // Mettre à jour les panneaux d'onglet
        if (this.prescriptionsPanel && this.medicationsPanel && this.messagesPanel) {
            this.prescriptionsPanel.classList.toggle('active', tab === 'prescriptions');
            this.medicationsPanel.classList.toggle('active', tab === 'medications');
            this.messagesPanel.classList.toggle('active', tab === 'messages');
            
            // Supprimer la classe hidden pour compatibilité avec les anciens styles
            this.prescriptionsPanel.classList.toggle('hidden', tab !== 'prescriptions');
            this.medicationsPanel.classList.toggle('hidden', tab !== 'medications');
            this.messagesPanel.classList.toggle('hidden', tab !== 'messages');
        }
        
        // Charger les données si passage à l'onglet messages
        if (tab === 'messages') {
            this.loadPatients();
        }
    }
    
    /**
     * Charger toutes les données pour le tableau de bord médecin
     */
    async loadData() {
        console.log("Chargement des données du médecin");
        
        try {
            await Promise.all([
                this.loadPrescriptions(),
                this.loadMedications(),
                this.loadPatients()
            ]);
            console.log("Toutes les données du médecin ont été chargées");
        } catch (error) {
            console.error("Erreur lors du chargement des données du médecin:", error);
        }
    }
    
    /**
     * Charger les prescriptions créées par le médecin actuel
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
     * Charger les médicaments
     */
    async loadMedications() {
        console.log("Chargement des médicaments");
        
        try {
            const response = await ApiService.getMedications();
            
            if (response.success) {
                console.log("Médicaments chargés:", response.medications);
                this.medications = response.medications;
                this.renderMedications();
            } else {
                console.log("Échec du chargement des médicaments:", response.message);
            }
        } catch (error) {
            console.error('Erreur de chargement des médicaments:', error);
        }
    }
    
    /**
     * Charger les patients pour les prescriptions et la messagerie
     */
    async loadPatients() {
        console.log("Chargement des patients");
        
        try {
            const response = await ApiService.getUsers(false);
            
            if (response.success) {
                console.log("Patients chargés:", response.users);
                this.patients = response.users;
                this.renderMessageList();
                
                // Mettre à jour la sélection de patient dans la modale de prescription
                this.populatePrescriptionModal();
            } else {
                console.log("Échec du chargement des patients:", response.message);
            }
        } catch (error) {
            console.error('Erreur de chargement des patients:', error);
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
            title.textContent = prescription.patient_name || "Patient";
            
            const status = document.createElement('div');
            status.className = 'prescription-status';
            status.textContent = prescription.active ? 'Actif' : 'Inactif';
            status.style.color = prescription.active ? 'var(--success-color)' : 'var(--error-color)';
            
            header.appendChild(title);
            header.appendChild(status);
            card.appendChild(header);
            
            const details = document.createElement('div');
            details.className = 'prescription-details';
            
            // Détails du médicament
            const medicationDetail = document.createElement('div');
            medicationDetail.className = 'prescription-detail';
            medicationDetail.innerHTML = `<span>Médicament:</span><span>${prescription.medication_name || "Inconnu"} (${prescription.medication_dosage || ""})</span>`;
            
            // Détails du compartiment
            const compartmentDetail = document.createElement('div');
            compartmentDetail.className = 'prescription-detail';
            compartmentDetail.innerHTML = `<span>Compartiment:</span><span>${prescription.motor_number || "N/A"}</span>`;
            
            // Détails de l'heure
            const timeDetail = document.createElement('div');
            timeDetail.className = 'prescription-detail';
            timeDetail.innerHTML = `<span>Heure:</span><span>${prescription.intake_time || "N/A"}</span>`;
            
            details.appendChild(medicationDetail);
            details.appendChild(compartmentDetail);
            details.appendChild(timeDetail);
            card.appendChild(details);
            
            // Boutons d'action (uniquement pour les prescriptions actives)
            if (prescription.active) {
                const actions = document.createElement('div');
                actions.className = 'prescription-actions';
                
                const deactivateButton = document.createElement('button');
                deactivateButton.className = 'deactivate';
                deactivateButton.textContent = 'Désactiver';
                deactivateButton.addEventListener('click', () => {
                    console.log(`Demande de désactivation de la prescription ${prescription.id}`);
                    this.deactivatePrescription(prescription.id);
                });
                
                actions.appendChild(deactivateButton);
                card.appendChild(actions);
            }
            
            this.prescriptionList.appendChild(card);
        });
    }
    
    /**
     * Afficher les médicaments dans l'interface utilisateur
     */
    renderMedications() {
        console.log("Affichage des médicaments");
        
        if (!this.medicationList) {
            console.error("Élément medicationList introuvable");
            return;
        }
        
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
            name.textContent = medication.name || "Nom inconnu";
            
            const dosage = document.createElement('div');
            dosage.className = 'medication-dosage';
            dosage.textContent = medication.dosage || "Dosage inconnu";
            
            card.appendChild(name);
            card.appendChild(dosage);
            
            this.medicationList.appendChild(card);
        });
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
            contact.addEventListener('click', () => {
                console.log(`Conversation avec le patient ${patient.id} sélectionnée`);
                this.showConversation(patient.id, `${patient.first_name} ${patient.last_name}`);
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
    
    /**
     * Afficher la modale d'ajout de médicament
     */
    showMedicationModal() {
        console.log("Affichage de la modale Médicament");
        
        // Effacer les champs de saisie
        if (this.medicationNameInput) this.medicationNameInput.value = '';
        if (this.medicationDosageInput) this.medicationDosageInput.value = '';
        
        // Afficher la modale
        if (this.medicationModal) {
            this.medicationModal.classList.add('active');
            // Supprimer la classe hidden pour compatibilité avec les anciens styles
            this.medicationModal.classList.remove('hidden');
        }
    }
    
    /**
     * Masquer la modale d'ajout de médicament
     */
    hideMedicationModal() {
        console.log("Masquage de la modale Médicament");
        
        if (this.medicationModal) {
            this.medicationModal.classList.remove('active');
            // Ajouter la classe hidden pour compatibilité avec les anciens styles
            this.medicationModal.classList.add('hidden');
        }
    }
    
    /**
     * Sauvegarder un nouveau médicament
     */
    async saveMedication() {
        console.log("Sauvegarde d'un nouveau médicament");
        
        if (!this.medicationNameInput || !this.medicationDosageInput) {
            console.error("Éléments de formulaire introuvables");
            return;
        }
        
        const name = this.medicationNameInput.value.trim();
        const dosage = this.medicationDosageInput.value.trim();
        
        if (!name || !dosage) {
            console.log("Champs incomplets");
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            console.log(`Création d'un nouveau médicament: ${name}, ${dosage}`);
            const response = await ApiService.createMedication(name, dosage);
            
            if (response.success) {
                console.log("Médicament créé avec succès");
                // Masquer la modale
                this.hideMedicationModal();
                
                // Recharger les médicaments
                await this.loadMedications();
            } else {
                console.log("Échec de la création du médicament:", response.message);
                alert('Erreur lors de l\'enregistrement du médicament: ' + (response.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Erreur de sauvegarde du médicament:', error);
            alert('Erreur lors de l\'enregistrement du médicament. Veuillez réessayer.');
        }
    }
    
    /**
     * Afficher la modale d'ajout de prescription
     */
    showPrescriptionModal() {
        console.log("Affichage de la modale Prescription");
        
        // Réinitialiser le formulaire
        if (this.prescriptionTimeInput) this.prescriptionTimeInput.value = '';
        
        // Remplir les champs de sélection
        this.populatePrescriptionModal();
        
        // Afficher la modale
        if (this.prescriptionModal) {
            this.prescriptionModal.classList.add('active');
            // Supprimer la classe hidden pour compatibilité avec les anciens styles
            this.prescriptionModal.classList.remove('hidden');
        }
    }
    
    /**
     * Masquer la modale d'ajout de prescription
     */
    hidePrescriptionModal() {
        console.log("Masquage de la modale Prescription");
        
        if (this.prescriptionModal) {
            this.prescriptionModal.classList.remove('active');
            // Ajouter la classe hidden pour compatibilité avec les anciens styles
            this.prescriptionModal.classList.add('hidden');
        }
    }
    
    /**
     * Remplir la modale de prescription avec les patients et les médicaments
     */
    populatePrescriptionModal() {
        console.log("Remplissage de la modale Prescription");
        
        if (!this.prescriptionPatientSelect || !this.prescriptionMedicationSelect) {
            console.error("Éléments de sélection introuvables");
            return;
        }
        
        // Effacer les options existantes
        this.prescriptionPatientSelect.innerHTML = '';
        this.prescriptionMedicationSelect.innerHTML = '';
        
        // Ajouter les patients
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.first_name} ${patient.last_name}`;
            this.prescriptionPatientSelect.appendChild(option);
        });
        
        // Ajouter les médicaments
        this.medications.forEach(medication => {
            const option = document.createElement('option');
            option.value = medication.id;
            option.textContent = `${medication.name} (${medication.dosage})`;
            this.prescriptionMedicationSelect.appendChild(option);
        });
    }
    
    /**
     * Sauvegarder une nouvelle prescription
     */
    async savePrescription() {
        console.log("Sauvegarde d'une nouvelle prescription");
        
        if (!this.prescriptionPatientSelect || !this.prescriptionMedicationSelect || 
            !this.prescriptionMotorSelect || !this.prescriptionTimeInput) {
            console.error("Éléments de formulaire introuvables");
            return;
        }
        
        const patientId = this.prescriptionPatientSelect.value;
        const medicationId = this.prescriptionMedicationSelect.value;
        const motorNumber = this.prescriptionMotorSelect.value;
        const intakeTime = this.prescriptionTimeInput.value;
        
        if (!patientId || !medicationId || !motorNumber || !intakeTime) {
            console.log("Champs incomplets");
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            console.log(`Création d'une nouvelle prescription: patient=${patientId}, médicament=${medicationId}, moteur=${motorNumber}, heure=${intakeTime}`);
            const response = await ApiService.createPrescription(patientId, medicationId, motorNumber, intakeTime);
            
            if (response.success) {
                console.log("Prescription créée avec succès");
                // Masquer la modale
                this.hidePrescriptionModal();
                
                // Recharger les prescriptions
                await this.loadPrescriptions();
            } else {
                console.log("Échec de la création de la prescription:", response.message);
                alert('Erreur lors de l\'enregistrement de la prescription: ' + (response.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Erreur de sauvegarde de la prescription:', error);
            alert('Erreur lors de l\'enregistrement de la prescription. Veuillez réessayer.');
        }
    }
    
    /**
     * Désactiver une prescription
     * @param {number} prescriptionId - ID de la prescription à désactiver
     */
    async deactivatePrescription(prescriptionId) {
        console.log(`Demande de désactivation de la prescription ${prescriptionId}`);
        
        if (confirm('Êtes-vous sûr de vouloir désactiver cette prescription?')) {
            try {
                console.log(`Désactivation de la prescription ${prescriptionId}`);
                const response = await ApiService.deactivatePrescription(prescriptionId);
                
                if (response.success) {
                    console.log("Prescription désactivée avec succès");
                    await this.loadPrescriptions();
                } else {
                    console.log("Échec de la désactivation de la prescription:", response.message);
                    alert('Erreur lors de la désactivation de la prescription: ' + (response.message || 'Erreur inconnue'));
                }
            } catch (error) {
                console.error('Erreur de désactivation de la prescription:', error);
                alert('Erreur lors de la désactivation de la prescription. Veuillez réessayer.');
            }
        }
    }
}