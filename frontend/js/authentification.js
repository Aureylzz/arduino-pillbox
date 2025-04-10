/**
 * Fichier : authentification.js
 * ------------------------------------------------------------------------------
 * Gère l'authentification des utilisateurs (patients/médecins) :
 *  - Connexion
 *  - Déconnexion
 *  - Basculer l'interface (Patient / Médecin)
 *  - Vérifier la cohérence entre l'onglet choisi et le compte réellement utilisé
 * ------------------------------------------------------------------------------
 */

class GestionnaireAuthentification {
    constructor() {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCOPE A : RÉFÉRENCES DOM
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Sélection des éléments HTML : écrans, champs, boutons, etc.
        this.ecranConnexion = document.getElementById('ecran-connexion');
        
        // Bascule Patient / Médecin
        this.basculePatient = document.getElementById('bascule-patient');
        this.basculeMedecin = document.getElementById('bascule-medecin');
        
        // Champs de connexion
        this.champNomUtilisateur = document.getElementById('champ-nom-utilisateur');
        this.champMotDePasse = document.getElementById('champ-mot-de-passe');
        
        // Bouton de connexion
        this.boutonConnexion = document.getElementById('bouton-connexion');
        
        // Message d'erreur
        this.erreurConnexion = document.getElementById('erreur-connexion');
        
        // Tableaux de bord
        this.tableauBordPatient = document.getElementById('tableau-bord-patient');
        this.tableauBordMedecin = document.getElementById('tableau-bord-medecin');
        
        // Affichage du nom dans l'en-tête
        this.nomPatient = document.getElementById('nom-patient');
        this.nomMedecin = document.getElementById('nom-medecin');
        
        // Boutons de déconnexion
        this.deconnexionPatient = document.getElementById('deconnexion-patient');
        this.deconnexionMedecin = document.getElementById('deconnexion-medecin');
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCOPE B : ÉTAT INTERNE
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // On mémorise l'utilisateur actuel et s'il est médecin ou non
        this.utilisateurActuel = null;
        this.estMedecin = false; // Par défaut, on considère "patient"
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCOPE C : ATTACHER LES ÉVÉNEMENTS
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.attacherEvenements();
    }
    
    attacherEvenements() {
        /* Bascule Patient / Médecin */
        if (this.basculePatient) {
            this.basculePatient.addEventListener('click', () => {
                this.basculerTypeUtilisateur(false);
            });
        }
        if (this.basculeMedecin) {
            this.basculeMedecin.addEventListener('click', () => {
                this.basculerTypeUtilisateur(true);
            });
        }
        
        /* Connexion au clic sur le bouton */
        if (this.boutonConnexion) {
            this.boutonConnexion.addEventListener('click', () => {
                this.connecter();
            });
        }
        
        /* Connexion via la touche "Enter" dans le champ mot de passe */
        if (this.champMotDePasse) {
            this.champMotDePasse.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.connecter();
                }
            });
        }
        
        /* Déconnexion pour patient et médecin */
        if (this.deconnexionPatient) {
            this.deconnexionPatient.addEventListener('click', () => {
                this.deconnecter();
            });
        }
        if (this.deconnexionMedecin) {
            this.deconnexionMedecin.addEventListener('click', () => {
                this.deconnecter();
            });
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE D : GESTION PATIENT / MÉDECIN
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * Permet de basculer l'interface (Patient ou Médecin) via les onglets de la page de connexion.
     * @param {boolean} estMedecin - True => Médecin, False => Patient
     */
    basculerTypeUtilisateur(estMedecin) {
        // Activation visuelle de l'onglet cliqué
        if (estMedecin) {
            this.basculeMedecin.classList.add('actif');
            this.basculePatient.classList.remove('actif');
        } else {
            this.basculeMedecin.classList.remove('actif');
            this.basculePatient.classList.add('actif');
        }
        this.estMedecin = estMedecin;
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE E : CONNEXION / DÉCONNEXION
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async connecter() {
        const nomUtilisateur = this.champNomUtilisateur.value.trim();
        const motDePasse = this.champMotDePasse.value;
        
        if (!nomUtilisateur || !motDePasse) {
            this.afficherErreur('Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            // On transmet le booléen this.estMedecin
            const reponse = await ClientAPI.connexion(nomUtilisateur, motDePasse, this.estMedecin);
            
            if (reponse.succes) {
                // Connexion réussie
                this.utilisateurActuel = reponse.utilisateur;
                this.afficherTableauBord();
                this.effacerFormulaireConnexion();
            } else {
                // Erreur de login
                this.afficherErreur(reponse.message || 'Identifiants invalides.');
            }
        } catch (erreur) {
            console.error('Erreur de connexion:', erreur);
            this.afficherErreur('Une erreur est survenue, veuillez réessayer.');
        }
    }
    
    async deconnecter() {
        try {
            await ClientAPI.deconnexion();
        } catch (erreur) {
            console.error('Erreur de déconnexion:', erreur);
        } finally {
            // On réinitialise
            this.utilisateurActuel = null;
            this.afficherEcranConnexion();
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCOPE F : AFFICHAGE / ERREURS / NAVIGATION
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * Affiche un message d'erreur dans la zone prévue ou via un alert() si indisponible.
     * @param {string} message
     */
    afficherErreur(message) {
        if (this.erreurConnexion) {
            this.erreurConnexion.textContent = message;
            this.erreurConnexion.style.display = 'block';
        } else {
            alert(`Erreur: ${message}`);
        }
    }
    
    /**
     * Réinitialise les champs de connexion et cache le message d'erreur si présent.
     */
    effacerFormulaireConnexion() {
        if (this.champNomUtilisateur) this.champNomUtilisateur.value = '';
        if (this.champMotDePasse) this.champMotDePasse.value = '';
        if (this.erreurConnexion) {
            this.erreurConnexion.textContent = '';
            this.erreurConnexion.style.display = 'none';
        }
    }
    
    /**
     * Affiche le tableau de bord adéquat (patient ou médecin) et cache l'écran de connexion.
     */
    afficherTableauBord() {
        // Masquer l'écran de connexion
        if (this.ecranConnexion) {
            this.ecranConnexion.classList.add('masque');
        }
        
        if (this.utilisateurActuel.estMedecin) {
            // Tableau de bord médecin
            if (this.tableauBordMedecin) {
                this.tableauBordMedecin.classList.remove('masque');
            }
            if (this.nomMedecin) {
                this.nomMedecin.textContent = `${this.utilisateurActuel.prenom} ${this.utilisateurActuel.nom}`;
            }
            if (window.gestionnaireMedecin) {
                window.gestionnaireMedecin.chargerDonnees();
            }
        } else {
            // Tableau de bord patient
            if (this.tableauBordPatient) {
                this.tableauBordPatient.classList.remove('masque');
            }
            if (this.nomPatient) {
                this.nomPatient.textContent = `${this.utilisateurActuel.prenom} ${this.utilisateurActuel.nom}`;
            }
            if (window.gestionnairePatient) {
                window.gestionnairePatient.chargerDonnees();
            }
        }
    }
    
    /**
     * Revient à l'écran de connexion (par exemple après déconnexion).
     */
    afficherEcranConnexion() {
        if (this.ecranConnexion) {
            this.ecranConnexion.classList.remove('masque');
        }
        if (this.tableauBordPatient) {
            this.tableauBordPatient.classList.add('masque');
        }
        if (this.tableauBordMedecin) {
            this.tableauBordMedecin.classList.add('masque');
        }
    }
    
    /**
     * Retourne l'utilisateur actuel (si connecté).
     */
    obtenirUtilisateurActuel() {
        return this.utilisateurActuel;
    }
}