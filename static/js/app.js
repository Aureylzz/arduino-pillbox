/**
 * Point d'entrée principal de l'application
 * Initialise tous les gestionnaires et composants
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Démarrage de l'application Pilulier Intelligent");
    
    // Vérifier si la classe hidden est correctement définie en CSS
    const style = document.createElement('style');
    style.textContent = `
        .hidden {
            display: none !important;
        }
        
        .active {
            /* Style pour les éléments actifs, si non défini dans le CSS principal */
        }
    `;
    document.head.appendChild(style);
    
    // Tester la connexion API
    ApiService.testConnection()
        .then(success => {
            console.log("Test de connexion API:", success ? "réussi" : "échoué");
        })
        .catch(error => {
            console.error("Erreur lors du test de connexion API:", error);
        });
    
    // Initialiser les gestionnaires
    console.log("Initialisation des gestionnaires");
    window.authManager = new AuthManager();
    window.patientManager = new PatientManager();
    window.doctorManager = new DoctorManager();
    
    // Garantir que les onglets patient sont correctement configurés au démarrage
    if (window.patientManager) {
        const medicationsPanel = document.getElementById('medications-panel');
        const messagesPanel = document.getElementById('messages-panel');
        
        if (medicationsPanel && messagesPanel) {
            medicationsPanel.classList.add('active');
            medicationsPanel.classList.remove('hidden');
            messagesPanel.classList.remove('active');
            messagesPanel.classList.add('hidden');
        }
    }
    
    // Garantir que les onglets médecin sont correctement configurés au démarrage
    if (window.doctorManager) {
        const prescriptionsPanel = document.getElementById('prescriptions-panel');
        const medicationsPanel = document.getElementById('doc-medications-panel');
        const messagesPanel = document.getElementById('doc-messages-panel');
        
        if (prescriptionsPanel && medicationsPanel && messagesPanel) {
            prescriptionsPanel.classList.add('active');
            prescriptionsPanel.classList.remove('hidden');
            medicationsPanel.classList.remove('active');
            medicationsPanel.classList.add('hidden');
            messagesPanel.classList.remove('active');
            messagesPanel.classList.add('hidden');
        }
    }
    
    // Garantir que les modales sont masquées au démarrage
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('active');
    });
    
    console.log("Système de Pilulier Intelligent initialisé");
});