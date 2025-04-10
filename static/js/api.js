/**
 * API Service
 * Handles all communication with the backend API
 */
class ApiService {
    /**
     * Send a request to the API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {object} data - Request data
     * @returns {Promise} - Response promise
     */
    static async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin' // Include cookies in request
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`/api/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Authentication
     */
    static async login(username, password) {
        return this.request('login', 'POST', { username, password });
    }

    static async logout() {
        return this.request('logout', 'POST');
    }

    /**
     * Users
     */
    static async getUsers(isDoctor) {
        return this.request(`users?is_doctor=${isDoctor}`);
    }

    /**
     * Medications
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
     * Pillbox Control
     */
    static async controlPillbox(motorNumber, action) {
        return this.request('pillbox/control', 'POST', { motor_number: motorNumber, action });
    }
}