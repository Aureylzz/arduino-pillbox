/**
 * Fichier : application_principale.js
 * ----------------------------------------------------------------------------------------------------------
 * Point d'entrée principal de l'application côté client.
 * Initialise les gestionnaires (patient/médecin/authentification) et vérifie la connexion API au démarrage.
 *
 * Ajoute également la mise à jour de l'horloge en temps réel dans le <div id="footer-horloge"> (si présent).
 * ----------------------------------------------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Démarrage de l'application Pilulier Intelligent (côté client).");

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE A : TEST DE CONNEXION API (Optionnel)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // On vérifie si l'API est accessible (retourne un booléen).
    ClientAPI.testerConnexion()
        .then(reponse => {
            console.log("Test de connexion API:", reponse ? "Succès" : "Échec");
        })
        .catch(err => {
            console.error("Erreur de test de connexion:", err);
        });
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE B : INITIALISATION DES GESTIONNAIRES
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Création globale des gestionnaires (auth, patient, médecin).
    window.gestionnaireAuthentification = new GestionnaireAuthentification();
    window.gestionnairePatient = new GestionnairePatient();
    window.gestionnaireMedecin = new GestionnaireMedecin();
    
    console.log("Gestionnaires patient et médecin initialisés.");
    console.log("Application prête.");

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE C : MISE À JOUR DE L'HORLOGE EN TEMPS RÉEL
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const divHorloge = document.getElementById('footer-horloge');
    if (divHorloge) {
        // Fonction interne pour mettre à jour l'horloge
        function mettreAJourHorloge() {
            const maintenant = new Date();
            // On récupère l'heure locale au format HH:MM:SS
            const texteHeure = maintenant.toLocaleTimeString(); 
            divHorloge.textContent = "Heure du programme : " + texteHeure;
        }

        // Appel initial et ensuite toutes les secondes
        mettreAJourHorloge();
        setInterval(mettreAJourHorloge, 1000);
    }
});
