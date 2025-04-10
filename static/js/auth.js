/**
 * Authentication Module
 * Handles user authentication and session management
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isDoctor = false;
        
        // DOM Elements - Login Screen
        this.loginScreen = document.getElementById('login-screen');
        this.patientToggle = document.getElementById('patient-toggle');
        this.doctorToggle = document.getElementById('doctor-toggle');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('login-button');
        this.loginError = document.getElementById('login-error');
        
        // DOM Elements - Dashboard Screens
        this.patientDashboard = document.getElementById('patient-dashboard');
        this.doctorDashboard = document.getElementById('doctor-dashboard');
        this.patientName = document.getElementById('patient-name');
        this.doctorName = document.getElementById('doctor-name');
        this.patientLogout = document.getElementById('patient-logout');
        this.doctorLogout = document.getElementById('doctor-logout');
        
        // Bind event handlers
        this.bindEvents();
    }
    
    /**
     * Bind event handlers to DOM elements
     */
    bindEvents() {
        // Toggle between patient and doctor login
        this.patientToggle.addEventListener('click', () => this.toggleUserType('patient'));
        this.doctorToggle.addEventListener('click', () => this.toggleUserType('doctor'));
        
        // Login button
        this.loginButton.addEventListener('click', () => this.login());
        
        // Enter key in password field
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        // Logout buttons
        this.patientLogout.addEventListener('click', () => this.logout());
        this.doctorLogout.addEventListener('click', () => this.logout());
    }
    
    /**
     * Toggle between patient and doctor login
     * @param {string} userType - 'patient' or 'doctor'
     */
    toggleUserType(userType) {
        if (userType === 'patient') {
            this.patientToggle.classList.add('active');
            this.doctorToggle.classList.remove('active');
            this.isDoctor = false;
        } else {
            this.patientToggle.classList.remove('active');
            this.doctorToggle.classList.add('active');
            this.isDoctor = true;
        }
    }
    
    /**
     * Attempt to log in with current credentials
     */
    async login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        if (!username || !password) {
            this.showLoginError('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            const response = await ApiService.login(username, password);
            
            if (response.success) {
                this.currentUser = response.user;
                this.showDashboard();
                this.clearLoginForm();
            } else {
                this.showLoginError(response.message || 'Identifiants invalides.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Une erreur est survenue. Veuillez réessayer.');
        }
    }
    
    /**
     * Log out current user
     */
    async logout() {
        try {
            await ApiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.showLoginScreen();
        }
    }
    
    /**
     * Show login error message
     * @param {string} message - Error message to display
     */
    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
    }
    
    /**
     * Clear login form and error message
     */
    clearLoginForm() {
        this.usernameInput.value = '';
        this.passwordInput.value = '';
        this.loginError.textContent = '';
        this.loginError.style.display = 'none';
    }
    
    /**
     * Show appropriate dashboard based on user type
     */
    showDashboard() {
        this.loginScreen.classList.add('hidden');
        
        if (this.currentUser.is_doctor) {
            this.doctorDashboard.classList.remove('hidden');
            this.doctorName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            // Trigger initial data load for doctor
            if (window.doctorManager) {
                window.doctorManager.loadData();
            }
        } else {
            this.patientDashboard.classList.remove('hidden');
            this.patientName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            // Trigger initial data load for patient
            if (window.patientManager) {
                window.patientManager.loadData();
            }
        }
    }
    
    /**
     * Show login screen and hide dashboards
     */
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.patientDashboard.classList.add('hidden');
        this.doctorDashboard.classList.add('hidden');
    }
    
    /**
     * Get current authenticated user
     * @returns {Object|null} - Current user object or null if not authenticated
     */
    getCurrentUser() {
        return this.currentUser;
    }
}