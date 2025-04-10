/**
 * Fichier : api_client.js
 * -------------------------------------------------------------------------
 * Service d'API pour le système de Pilulier Intelligent.
 *
 * Gère la logique de requêtes HTTP (fetch) vers les endpoints /api/...
 *  - requete() : méthode générique
 *  - connexions, déconnexions
 *  - gestion des utilisateurs, médicaments, prescriptions, messages
 *  - contrôle du pilulier (Arduino)
 * -------------------------------------------------------------------------
 */

class ClientAPI {
    /**
     * Méthode générique pour faire des requêtes API.
     * @param {string} endpoint   - La route (ex: 'medicaments')
     * @param {string} methode    - Méthode HTTP (GET, POST, PUT, etc.)
     * @param {object} donnees    - Corps de la requête (JSON)
     */
    static async requete(endpoint, methode = 'GET', donnees = null) {
        console.log(`Requête API: ${methode} /api/${endpoint}`, donnees);

        const options = {
            method: methode,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'  // Inclure les cookies de session
        };

        // Si la méthode l'exige, on insère le corps JSON dans la requête
        if (donnees && (methode === 'POST' || methode === 'PUT')) {
            options.body = JSON.stringify(donnees);
        }

        try {
            const reponse = await fetch(`/api/${endpoint}`, options);
            const contenu = await reponse.json();
            console.log(`Réponse API: ${methode} /api/${endpoint}`, contenu);
            return contenu;
        } catch (erreur) {
            console.error('Erreur lors de la requête API:', erreur);
            throw erreur; // Propager l'erreur
        }
    }

    /* =========================================================================
       SCOPE A : AUTHENTIFICATION
       ========================================================================= */
    /**
     * Connexion avec indication patient/médecin choisie sur le front.
     * @param {string} nomUtilisateur
     * @param {string} motDePasse
     * @param {boolean} estMedecinChoisi - true si onglet "Médecin"
     */
    static async connexion(nomUtilisateur, motDePasse, estMedecinChoisi) {
        return this.requete('connexion', 'POST', {
            nomUtilisateur,
            motDePasse,
            estMedecinChoisi
        });
    }

    static async deconnexion() {
        return this.requete('deconnexion', 'POST');
    }

    /* =========================================================================
       SCOPE B : UTILISATEURS
       ========================================================================= */
    /**
     * Récupère la liste des utilisateurs : filtrage possible via estMedecin=1/0.
     * @param {boolean} estMedecin 
     */
    static async obtenirUtilisateurs(estMedecin) {
        // ex. /api/utilisateurs?estMedecin=1
        return this.requete(`utilisateurs?estMedecin=${estMedecin ? 1 : 0}`);
    }

    /* =========================================================================
       SCOPE C : MÉDICAMENTS
       ========================================================================= */
    /**
     * Récupère tous les médicaments.
     */
    static async obtenirMedicaments() {
        return this.requete('medicaments', 'GET');
    }

    /**
     * Crée un nouveau médicament.
     * @param {string} nom 
     * @param {string} dosage 
     */
    static async creerMedicament(nom, dosage) {
        return this.requete('medicaments', 'POST', { nom, dosage });
    }

    /* =========================================================================
       SCOPE D : PRESCRIPTIONS
       ========================================================================= */
    /**
     * Récupère les prescriptions (déterminées par le back selon patient/médecin).
     */
    static async obtenirPrescriptions() {
        return this.requete('prescriptions', 'GET');
    }

    /**
     * Crée une prescription (medecin).
     * @param {number} idPatient 
     * @param {number} idMedicament 
     * @param {number} numeroMoteur 
     * @param {string} heurePrise 
     */
    static async creerPrescription(idPatient, idMedicament, numeroMoteur, heurePrise) {
        return this.requete('prescriptions', 'POST', {
            idPatient,
            idMedicament,
            numeroMoteur,
            heurePrise
        });
    }

    /**
     * Désactive une prescription (actif=0).
     * @param {number} idPrescription 
     */
    static async desactiverPrescription(idPrescription) {
        return this.requete(`prescriptions/${idPrescription}/desactiver`, 'POST');
    }

    /* =========================================================================
       SCOPE E : MESSAGERIE
       ========================================================================= */
    /**
     * Récupère tous les messages liés à l'utilisateur connecté.
     */
    static async obtenirMessages() {
        return this.requete('messages', 'GET');
    }

    /**
     * Récupère la conversation entre l'utilisateur connecté et un autre utilisateur.
     * @param {number} idUtilisateur
     */
    static async obtenirConversation(idUtilisateur) {
        return this.requete(`conversations/${idUtilisateur}`, 'GET');
    }

    /**
     * Envoie un message (contenu) à un destinataire donné.
     * @param {number} idDestinataire
     * @param {string} contenu
     */
    static async envoyerMessage(idDestinataire, contenu) {
        return this.requete('messages', 'POST', { idDestinataire, contenu });
    }

    /* =========================================================================
       SCOPE F : CONTRÔLE DU PILULIER (Arduino)
       ========================================================================= */
    /**
     * Envoie une commande (ouvrir/fermer) au pilulier.
     * @param {number} numeroMoteur 
     * @param {string} action        - "ouvrir" ou "fermer"
     * @param {boolean} estProgramme - si c'est une ouverture programmée
     */
    static async controlerPilulier(numeroMoteur, action, estProgramme=false) {
        return this.requete('pilulier/controle', 'POST', { numeroMoteur, action, estProgramme });
    }
    
    /**
     * Récupère l'état du pilulier (ouvert/fermé).
     */
    static async obtenirEtatPilulier() {
        return this.requete('pilulier/etat', 'GET');
    }
    
    /* =========================================================================
       SCOPE G : TEST DE CONNEXION (optionnel)
       ========================================================================= */
    /**
     * Tente une requête de connexion (test).
     * Renvoie true si la connexion est OK (200), false en cas d'erreur ou de statut != 2xx.
     */
    static async testerConnexion() {
        try {
            const reponse = await fetch('/api/connexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomUtilisateur: 'test', motDePasse: 'test' })
            });
            return reponse.ok;
        } catch (erreur) {
            console.error("Erreur test connexion:", erreur);
            return false;
        }
    }
}