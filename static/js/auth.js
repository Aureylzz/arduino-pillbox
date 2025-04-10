/**
 * Module d'authentification
 * Gère l'authentification des utilisateurs et la gestion des sessions
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isDoctor = false;
        
        // Éléments DOM - Écran de connexion
        this.loginScreen = document.getElementById('login-screen');
        this.patientToggle = document.getElementById('patient-toggle');
        this.doctorToggle = document.getElementById('doctor-toggle');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('login-button');
        this.loginError = document.getElementById('login-error');
        
        // Éléments DOM - Tableaux de bord
        this.patientDashboard = document.getElementById('patient-dashboard');
        this.doctorDashboard = document.getElementById('doctor-dashboard');
        this.patientName = document.getElementById('patient-name');
        this.doctorName = document.getElementById('doctor-name');
        this.patientLogout = document.getElementById('patient-logout');
        this.doctorLogout = document.getElementById('doctor-logout');
        
        // Vérifie si tous les éléments DOM sont présents
        console.log("Éléments d'authentification:", {
            loginScreen: this.loginScreen,
            patientToggle: this.patientToggle,
            doctorToggle: this.doctorToggle,
            usernameInput: this.usernameInput,
            passwordInput: this.passwordInput,
            loginButton: this.loginButton,
            loginError: this.loginError,
            patientDashboard: this.patientDashboard,
            doctorDashboard: this.doctorDashboard
        });
        
        // Associer les gestionnaires d'événements
        this.bindEvents();
    }
    
    /**
     * Associer les gestionnaires d'événements aux éléments DOM
     */
    bindEvents() {
        console.log("Attachement des événements d'authentification");
        
        // Basculer entre la connexion patient et médecin
        if (this.patientToggle) {
            this.patientToggle.addEventListener('click', () => {
                console.log("Basculement vers Patient");
                this.toggleUserType('patient');
            });
        }
        
        if (this.doctorToggle) {
            this.doctorToggle.addEventListener('click', () => {
                console.log("Basculement vers Médecin");
                this.toggleUserType('doctor');
            });
        }
        
        // Bouton de connexion
        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => {
                console.log("Bouton de connexion cliqué");
                this.login();
            });
        }
        
        // Touche Entrée dans le champ du mot de passe
        if (this.passwordInput) {
            this.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log("Touche Entrée pressée dans le champ mot de passe");
                    this.login();
                }
            });
        }
        
        // Boutons de déconnexion
        if (this.patientLogout) {
            this.patientLogout.addEventListener('click', () => {
                console.log("Déconnexion patient");
                this.logout();
            });
        }
        
        if (this.doctorLogout) {
            this.doctorLogout.addEventListener('click', () => {
                console.log("Déconnexion médecin");
                this.logout();
            });
        }
    }
    
    /**
     * Basculer entre les types d'utilisateur (patient ou médecin)
     * @param {string} userType - 'patient' ou 'doctor'
     */
    toggleUserType(userType) {
        console.log(`Basculement du type d'utilisateur vers: ${userType}`);
        
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
     * Tenter de se connecter avec les identifiants actuels
     */
    async login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        console.log(`Tentative de connexion avec: ${username}`);
        
        if (!username || !password) {
            this.showLoginError('Veuillez remplir tous les champs.');
            return;
        }
        
        // Option de test - permet de se connecter sans API
        // Utile pour déboguer l'interface utilisateur
        if (username === 'test' && password === 'test') {
            console.log("Connexion de test réussie");
            this.currentUser = {
                id: 0,
                first_name: 'Utilisateur',
                last_name: 'Test',
                is_doctor: this.isDoctor
            };
            this.showDashboard();
            this.clearLoginForm();
            return;
        }
        
        try {
            console.log("Envoi de la requête API de connexion");
            const response = await ApiService.login(username, password);
            
            if (response.success) {
                console.log("Connexion réussie:", response.user);
                this.currentUser = response.user;
                this.showDashboard();
                this.clearLoginForm();
            } else {
                console.log("Échec de la connexion:", response.message);
                this.showLoginError(response.message || 'Identifiants invalides.');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showLoginError('Une erreur est survenue. Veuillez réessayer.');
        }
    }
    
    /**
     * Déconnecter l'utilisateur actuel
     */
    async logout() {
        console.log("Déconnexion de l'utilisateur");
        
        try {
            await ApiService.logout();
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        } finally {
            this.currentUser = null;
            this.showLoginScreen();
        }
    }
    
    /**
     * Afficher un message d'erreur de connexion
     * @param {string} message - Message d'erreur à afficher
     */
    showLoginError(message) {
        console.log("Affichage de l'erreur de connexion:", message);
        
        if (this.loginError) {
            this.loginError.textContent = message;
            this.loginError.style.display = 'block';
        } else {
            // Fallback si l'élément d'erreur n'est pas trouvé
            alert(`Erreur de connexion: ${message}`);
        }
    }
    
    /**
     * Effacer le formulaire de connexion et le message d'erreur
     */
    clearLoginForm() {
        console.log("Effacement du formulaire de connexion");
        
        if (this.usernameInput) this.usernameInput.value = '';
        if (this.passwordInput) this.passwordInput.value = '';
        if (this.loginError) {
            this.loginError.textContent = '';
            this.loginError.style.display = 'none';
        }
    }
    
    /**
     * Afficher le tableau de bord approprié en fonction du type d'utilisateur
     */
    showDashboard() {
        console.log("Affichage du tableau de bord pour:", this.currentUser);
        
        if (this.loginScreen) this.loginScreen.classList.add('hidden');
        
        if (this.currentUser.is_doctor) {
            if (this.doctorDashboard) this.doctorDashboard.classList.remove('hidden');
            if (this.doctorName) this.doctorName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            // Déclencher le chargement initial des données pour le médecin
            if (window.doctorManager) {
                window.doctorManager.loadData();
            }
        } else {
            if (this.patientDashboard) this.patientDashboard.classList.remove('hidden');
            if (this.patientName) this.patientName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            // Déclencher le chargement initial des données pour le patient
            if (window.patientManager) {
                window.patientManager.loadData();
            }
        }
    }
    
    /**
     * Afficher l'écran de connexion et masquer les tableaux de bord
     */
    showLoginScreen() {
        console.log("Retour à l'écran de connexion");
        
        if (this.loginScreen) this.loginScreen.classList.remove('hidden');
        if (this.patientDashboard) this.patientDashboard.classList.add('hidden');
        if (this.doctorDashboard) this.doctorDashboard.classList.add('hidden');
    }
    
    /**
     * Obtenir l'utilisateur authentifié actuel
     * @returns {Object|null} - Objet utilisateur actuel ou null si non authentifié
     */
    getCurrentUser() {
        return this.currentUser;
    }
}