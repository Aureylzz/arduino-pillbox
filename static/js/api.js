/**
 * API Service
 * Gère toutes les communications avec le backend API
 */
class ApiService {
    /**
     * Envoyer une requête à l'API
     * @param {string} endpoint - Point de terminaison API
     * @param {string} method - Méthode HTTP
     * @param {object} data - Données de la requête
     * @returns {Promise} - Promesse de réponse
     */
    static async request(endpoint, method = 'GET', data = null) {
        console.log(`API Request: ${method} ${endpoint}`, data);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin' // Inclure les cookies dans la requête
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`/api/${endpoint}`, options);
            const responseData = await response.json();
            console.log(`API Response: ${method} ${endpoint}`, responseData);
            return responseData;
        } catch (error) {
            console.error('Erreur de requête API:', error);
            throw error;
        }
    }

    /**
     * Authentification
     */
    static async login(username, password) {
        return this.request('login', 'POST', { username, password });
    }

    static async logout() {
        return this.request('logout', 'POST');
    }

    /**
     * Utilisateurs
     */
    static async getUsers(isDoctor) {
        return this.request(`users?is_doctor=${isDoctor}`);
    }

    /**
     * Médicaments
     */
    static async getMedications() {
        return this.request('medications');
    }

    static async createMedication(name, dosage) {
        return this.request('medications', 'POST', { name, dosage });
    }

    /**
     * Prescriptions
     */
    static async getPrescriptions() {
        return this.request('prescriptions');
    }

    static async createPrescription(patientId, medicationId, motorNumber, intakeTime) {
        return this.request('prescriptions', 'POST', {
            patient_id: patientId,
            medication_id: medicationId,
            motor_number: motorNumber,
            intake_time: intakeTime
        });
    }

    static async deactivatePrescription(prescriptionId) {
        return this.request(`prescriptions/${prescriptionId}/deactivate`, 'POST');
    }

    /**
     * Messages
     */
    static async getMessages() {
        return this.request('messages');
    }

    static async getConversation(userId) {
        return this.request(`conversations/${userId}`);
    }

    static async sendMessage(receiverId, content) {
        return this.request('messages', 'POST', { receiver_id: receiverId, content });
    }

    /**
     * Contrôle du pilulier
     */
    static async controlPillbox(motorNumber, action) {
        return this.request('pillbox/control', 'POST', { motor_number: motorNumber, action });
    }
    
    /**
     * Test API - Fonction simplifiée pour tester la connectivité
     */
    static async testConnection() {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'test', password: 'test' })
            });
            
            return response.ok;
        } catch (error) {
            console.error("Erreur de connexion API:", error);
            return false;
        }
    }
}