/**
 * Fichier : gestionnaire_patient.js
 * ---------------------------------------------------------------------------------------------------------------------------------
 * Gère le tableau de bord du Patient :
 *  - Affichage du contrôle du pilulier (carte principale)
 *  - Affichage des périodes "Matin", "Midi", "Soir"
 *  - Chaque prescription apparaît comme une "mini-prescription-card" (titre, posologie, heure, bouton "Prendre maintenant", timer).
 *  - Messagerie : liste des médecins, conversation, envoi de messages.
 * ---------------------------------------------------------------------------------------------------------------------------------
 */

class GestionnairePatient {
    constructor() {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCOPE A : RÉFÉRENCES DOM (onglets, panneaux, etc.)
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        
        // Onglets
        this.ongletMedicaments = document.getElementById('onglet-medicaments');
        this.ongletMessages = document.getElementById('onglet-messages');
        
        // Panneaux
        this.panneauMedicaments = document.getElementById('panneau-medicaments');
        this.panneauMessages = document.getElementById('panneau-messages');
        
        // Conteneur affichant toutes les prescriptions
        this.listePrescriptions = document.getElementById('liste-prescriptions-patient');
        
        // Messagerie
        this.listeMessages = document.getElementById('liste-messages-patient');
        this.conversation = document.getElementById('conversation-patient');
        this.destinataireConversation = document.getElementById('destinataire-conversation');
        this.conteneurMessages = document.getElementById('conteneur-messages');
        this.champMessage = document.getElementById('champ-message');
        this.boutonEnvoyerMessage = document.getElementById('bouton-envoyer-message');
        this.boutonRetourListeMessages = document.getElementById('retour-liste-messages');
        
        // État local
        this.prescriptions = [];                        // Liste des prescriptions du patient
        this.medecins = [];                             // Liste des médecins (pour la messagerie)
        this.idUtilisateurConversationActuelle = null;
        this.etatPilulierOuvert = false;                // Indique si le pilulier est ouvert ou fermé
        
        // Contrôle du pilulier
        this.boutonOuvrirPilulier = null;
        this.boutonFermerPilulier = null;
        this.statutPilulier = null;
        
        // Timers pour chaque prescription
        this.timersPrescriptions = {};
        
        // Vérification périodique de l'état du pilulier
        this.demarrerVerificationEtatPilulier();
        
        // Attacher tous les événements
        this.attacherEvenements();
    }
    
    /**
     * Configure les listeners pour les onglets, la messagerie, etc.
     */
    attacherEvenements() {
        // Navigation onglets
        if (this.ongletMedicaments) {
            this.ongletMedicaments.addEventListener('click', () => {
                this.changerOnglet('medicaments');
            });
        }
        if (this.ongletMessages) {
            this.ongletMessages.addEventListener('click', () => {
                this.changerOnglet('messages');
            });
        }
        
        // Messagerie : envoi de message
        if (this.boutonEnvoyerMessage) {
            this.boutonEnvoyerMessage.addEventListener('click', () => {
                this.envoyerMessage();
            });
        }
        if (this.boutonRetourListeMessages) {
            this.boutonRetourListeMessages.addEventListener('click', () => {
                this.afficherListeMessages();
            });
        }
        if (this.champMessage) {
            // Envoi si "Enter" (sans Shift)
            this.champMessage.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.envoyerMessage();
                }
            });
        }
    }
    
    /**
     * Bascule l'interface entre "medicaments" et "messages".
     */
    changerOnglet(onglet) {
        this.ongletMedicaments.classList.toggle('actif', onglet === 'medicaments');
        this.ongletMessages.classList.toggle('actif', onglet === 'messages');
        
        this.panneauMedicaments.classList.toggle('actif', onglet === 'medicaments');
        this.panneauMessages.classList.toggle('actif', onglet === 'messages');
        
        this.panneauMedicaments.classList.toggle('masque', onglet !== 'medicaments');
        this.panneauMessages.classList.toggle('masque', onglet !== 'messages');
        
        // Si on est sur l'onglet Medicaments, on met à jour l'état du pilulier
        if (onglet === 'medicaments') {
            this.mettreAJourEtatPilulier();
        }
        // Si on est sur l'onglet Messages, on charge la liste des médecins
        if (onglet === 'messages') {
            this.chargerMedecins();
        }
    }
    
    /**
     * Lance un intervalle qui, toutes les 10 secondes, met à jour l'état du pilulier si l'onglet "Medicaments" est actif.
     */
    demarrerVerificationEtatPilulier() {
        this.intervalleVerification = setInterval(() => {
            if (this.ongletMedicaments && this.ongletMedicaments.classList.contains('actif')) {
                this.mettreAJourEtatPilulier();
            }
        }, 10000);
    }
    
    /**
     * Nettoie l'intervalle, si besoin, pour éviter tout rappel ultérieur.
     */
    arreterVerificationEtatPilulier() {
        if (this.intervalleVerification) {
            clearInterval(this.intervalleVerification);
        }
    }
    
    /**
     * Récupère l'état actuel du pilulier via l'API, puis met à jour les boutons (ouvrir/fermer).
     */
    async mettreAJourEtatPilulier() {
        try {
            const reponse = await ClientAPI.obtenirEtatPilulier();
            if (reponse.succes) {
                this.etatPilulierOuvert = reponse.estOuvert;
                this.mettreAJourBoutonsPilulier();
            }
        } catch (err) {
            console.error("Erreur lors de la récupération de l'état du pilulier:", err);
        }
    }
    
    /**
     * Active/désactive les boutons "Ouvrir" / "Fermer", et met à jour le texte du statut (Ouvert/Fermé).
     */
    mettreAJourBoutonsPilulier() {
        if (this.boutonOuvrirPilulier && this.boutonFermerPilulier && this.statutPilulier) {
            this.statutPilulier.textContent = this.etatPilulierOuvert ? "Statut: Ouvert" : "Statut: Fermé";
            this.statutPilulier.classList.toggle('statut-ouvert', this.etatPilulierOuvert);
            this.statutPilulier.classList.toggle('statut-ferme', !this.etatPilulierOuvert);
            
            // Désactive le bouton "Ouvrir" si pilulier déjà ouvert
            // Désactive le bouton "Fermer" si pilulier déjà fermé
            this.boutonOuvrirPilulier.disabled = this.etatPilulierOuvert;
            this.boutonFermerPilulier.disabled = !this.etatPilulierOuvert;
            
            // On ajoute/enlève la classe "desactive" pour le style
            if (this.etatPilulierOuvert) {
                this.boutonOuvrirPilulier.classList.add('desactive');
                this.boutonFermerPilulier.classList.remove('desactive');
            } else {
                this.boutonOuvrirPilulier.classList.remove('desactive');
                this.boutonFermerPilulier.classList.add('desactive');
            }
        }
    }
    
    /**
     * Récupère les prescriptions du patient, puis met à jour l'état du pilulier.
     */
    async chargerDonnees() {
        try {
            const reponse = await ClientAPI.obtenirPrescriptions();
            if (reponse.succes) {
                this.prescriptions = reponse.prescriptions;
                this.afficherPrescriptions();
            }
        } catch (err) {
            console.error("Erreur lors du chargement des prescriptions patient:", err);
        }
        
        // Ensuite, on actualise l'état du pilulier
        await this.mettreAJourEtatPilulier();
    }
    
    /**
     * Stoppe tous les compteurs pour les prescriptions (clearInterval).
     */
    arreterTousLesTimers() {
        for (const idPres in this.timersPrescriptions) {
            clearInterval(this.timersPrescriptions[idPres]);
        }
        this.timersPrescriptions = {};
    }
    
    /**
     * Construit l'UI pour la liste des prescriptions, incluant la carte de contrôle du pilulier et les cartes Matin/Midi/Soir.
     */
    afficherPrescriptions() {
        if (!this.listePrescriptions) return;
        
        // On arrête les anciens timers
        this.arreterTousLesTimers();
        
        this.listePrescriptions.innerHTML = '';
        
        if (this.prescriptions.length === 0) {
            this.listePrescriptions.innerHTML = '<p>Aucune prescription active.</p>';
            return;
        }
        
        // Création de la carte de contrôle du pilulier (ouverture/fermeture manuel)
        const carteControle = document.createElement('div');
        carteControle.className = 'carte-prescription carte-principale-controle carte-controle-ergonomique';
        
        // En-tête (titre + statut)
        const enTete = document.createElement('div');
        enTete.className = 'en_tete-prescription';
        
        const titre = document.createElement('div');
        titre.className = 'titre-prescription';
        titre.textContent = 'Contrôle du Pilulier';
        
        this.statutPilulier = document.createElement('div');
        this.statutPilulier.className = 'statut-pilulier';
        this.statutPilulier.textContent = 'Statut: ...';
        
        enTete.appendChild(titre);
        enTete.appendChild(this.statutPilulier);
        carteControle.appendChild(enTete);
        
        // Zone de contrôle (commandes manuelles)
        const controlesPilulier = document.createElement('div');
        controlesPilulier.className = 'controles-pilulier';
        
        const titreControles = document.createElement('h3');
        titreControles.textContent = 'Commandes Manuelles';
        controlesPilulier.appendChild(titreControles);
        
        const actions = document.createElement('div');
        actions.className = 'actions-prescription';
        
        // Bouton "Ouvrir le pilulier"
        this.boutonOuvrirPilulier = document.createElement('button');
        this.boutonOuvrirPilulier.textContent = 'Ouvrir le pilulier';
        this.boutonOuvrirPilulier.className = 'bouton-ouvrir';
        this.boutonOuvrirPilulier.addEventListener('click', () => {
            this.controlerPilulier(1, 'ouvrir');
        });
        
        // Bouton "Fermer le pilulier"
        this.boutonFermerPilulier = document.createElement('button');
        this.boutonFermerPilulier.textContent = 'Fermer le pilulier';
        this.boutonFermerPilulier.className = 'bouton-fermer-pilulier';
        this.boutonFermerPilulier.addEventListener('click', () => {
            this.controlerPilulier(1, 'fermer');
        });

        actions.appendChild(this.boutonOuvrirPilulier);
        actions.appendChild(this.boutonFermerPilulier);
        controlesPilulier.appendChild(actions);
        carteControle.appendChild(controlesPilulier);
        
        this.listePrescriptions.appendChild(carteControle);
        
        // Titre "Mes Prescriptions"
        const titrePrescriptions = document.createElement('h2');
        titrePrescriptions.className = 'titre-section-prescriptions';
        titrePrescriptions.textContent = 'Mes Prescriptions';
        this.listePrescriptions.appendChild(titrePrescriptions);
        
        // Conteneur horizontal pour Matin / Midi / Soir
        const conteneurCompartiments = document.createElement('div');
        conteneurCompartiments.className = 'cartes-prescriptions-horizontales';
        this.listePrescriptions.appendChild(conteneurCompartiments);
        
        // On définit les 3 périodes
        const PERIODES = [
            { moteur: 1, label: "Matin" },
            { moteur: 2, label: "Midi" },
            { moteur: 3, label: "Soir" }
        ];
        
        // Grouper les prescriptions actives par "numeroMoteur"
        const groupes = {};
        this.prescriptions.forEach(p => {
            if (!p.actif) return; 
            const mot = p.numeroMoteur;
            if (!groupes[mot]) groupes[mot] = [];
            groupes[mot].push(p);
        });
        
        // Pour chaque période (matin, midi, soir), on crée une carte
        PERIODES.forEach(per => {
            const carte = document.createElement('div');
            carte.className = 'carte-prescription';
            
            const enTete2 = document.createElement('div');
            enTete2.className = 'en_tete-prescription';
            
            const titre2 = document.createElement('div');
            titre2.className = 'titre-prescription';
            titre2.textContent = per.label;             // "Matin" / "Midi" / "Soir"
            
            enTete2.appendChild(titre2);
            carte.appendChild(enTete2);
            
            const details = document.createElement('div');
            details.className = 'details-prescription';
            
            // Récupère la liste pour cette période
            const listePourPeriode = groupes[per.moteur] || [];
            if (listePourPeriode.length === 0) {
                // S'il n'y a aucune prescription active pour ce créneau
                const ligneVide = document.createElement('p');
                ligneVide.textContent = 'Aucun médicament pour cette période.';
                details.appendChild(ligneVide);
            } else {
                // On crée une mini carte par prescription
                listePourPeriode.forEach(prescription => {
                    const miniCard = document.createElement('div');
                    miniCard.className = 'mini-prescription-card';
                    
                    // Header : nom du médicament + bouton "Prendre maintenant"
                    const miniHeader = document.createElement('div');
                    miniHeader.className = 'mini-prescription-header'; 
                    
                    const h4Titre = document.createElement('h4');
                    h4Titre.textContent = prescription.nomMedicament || 'Médicament';
                    
                    const btnPrendre = document.createElement('button');
                    btnPrendre.className = 'bouton-prendre-maintenant';
                    btnPrendre.textContent = 'Prendre maintenant';
                    btnPrendre.dataset.moteur = per.moteur;
                    btnPrendre.addEventListener('click', () => {
                        this.ouvrirPilulierProgramme(per.moteur);
                    });
                    
                    miniHeader.appendChild(h4Titre);
                    miniHeader.appendChild(btnPrendre);
                    miniCard.appendChild(miniHeader);
                    
                    // Posologie
                    const pPoso = document.createElement('p');
                    pPoso.textContent = "Posologie : " + (prescription.dosage_medicament || 'inconnue');
                    miniCard.appendChild(pPoso);
                    
                    // Heure de prise
                    const pHeure = document.createElement('p');
                    pHeure.textContent = "Heure : " + (prescription.heurePrise || '--:--');
                    miniCard.appendChild(pHeure);
                    
                    // Timer (compte à rebours)
                    const divTimer = document.createElement('div');
                    divTimer.className = 'ligne-detail';
                    
                    const lblC = document.createElement('span');
                    lblC.textContent = 'Prochaine prise dans :';
                    
                    const valCountdown = document.createElement('span');
                    valCountdown.className = 'compte-a-rebours';
                    valCountdown.textContent = '--:--:--';
                    
                    divTimer.appendChild(lblC);
                    divTimer.appendChild(valCountdown);
                    miniCard.appendChild(divTimer);
                    
                    // On lance le timer
                    this.demarrerTimerPrescription(prescription, valCountdown);
                    
                    details.appendChild(miniCard);
                });
            }
            
            carte.appendChild(details);
            conteneurCompartiments.appendChild(carte);
        });
    }
    
    /**
     * Calcule le délai jusqu'à la prochaine prise, puis décrémente chaque seconde.
     */
    demarrerTimerPrescription(prescription, elementCountdown) {
        // Fonctions internes pour parse l'heure et calculer le diff
        const parseHeurePrise = (heurePriseStr) => {
            const [hh, mm] = heurePriseStr.split(':').map(n => parseInt(n, 10));
            return {hh, mm};
        };
        const getSecondsUntilNext = (heurePriseStr) => {
            const now = new Date();
            const {hh, mm} = parseHeurePrise(heurePriseStr || "00:00");
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
            let diff = (target - now) / 1000;
            if (diff < 0) {
                diff += 24*3600; // si l'heure est déjà passée, on attend demain
            }
            return Math.floor(diff);
        };
        const afficherTemps = (secs) => {
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = secs % 60;
            return (
                String(h).padStart(2,'0') + ":" +
                String(m).padStart(2,'0') + ":" +
                String(s).padStart(2,'0')
            );
        };
        
        let secondsRestants = getSecondsUntilNext(prescription.heurePrise);
        elementCountdown.textContent = afficherTemps(secondsRestants);
        
        // On met à jour chaque seconde
        const intervalId = setInterval(() => {
            secondsRestants--;
            if (secondsRestants <= 0) {
                console.log(`==> Timer 0 pour prescription ${prescription.id}, on ouvre localement !`);
                this.controlerPilulier(prescription.numeroMoteur, 'ouvrir', true);
                secondsRestants = 24 * 3600; // On réinitialise pour le prochain jour
            }
            elementCountdown.textContent = afficherTemps(secondsRestants);
        }, 1000);
        
        // On stocke l'interval pour le stopper plus tard si besoin
        this.timersPrescriptions[prescription.id] = intervalId;
    }
    
    /**
     * Envoie une requête au back pour ouvrir/fermer le pilulier. Si !estProgramme, on affiche un alert() de confirmation.
     */
    async controlerPilulier(numeroMoteur, action, estProgramme=false) {
        try {
            const reponse = await ClientAPI.controlerPilulier(numeroMoteur, action, estProgramme);
            if (reponse.succes) {
                this.etatPilulierOuvert = (action === 'ouvrir');
                this.mettreAJourBoutonsPilulier();
                if (!estProgramme) {
                    alert(`Le pilulier a été ${action === 'ouvrir' ? 'ouvert' : 'fermé'} avec succès.`);
                }
            } else {
                // Gérer les erreurs (pilulier déjà ouvert/fermé, etc.)
                if (reponse.estDejaOuvert) {
                    this.etatPilulierOuvert = true;
                    alert("Le pilulier est déjà ouvert.");
                } else if (reponse.estDejaFerme) {
                    this.etatPilulierOuvert = false;
                    alert("Le pilulier est déjà fermé.");
                } else {
                    alert("Erreur : " + (reponse.message || "Inconnue"));
                }
                this.mettreAJourBoutonsPilulier();
            }
        } catch (err) {
            console.error('Erreur de contrôle du pilulier:', err);
            alert('Une erreur est survenue lors du contrôle du pilulier.');
        }
    }
    
    /**
     * Ouvre le pilulier de manière "programmée", c'est-à-dire pour la prise d'un médicament (avec auto-fermeture).
     */
    async ouvrirPilulierProgramme(numeroMoteur) {
        if (this.etatPilulierOuvert) {
            alert("Le pilulier est déjà ouvert. Il se fermera automatiquement après 1 minute.");
            return;
        }
        try {
            const reponse = await ClientAPI.controlerPilulier(numeroMoteur, 'ouvrir', true);
            if (reponse.succes) {
                this.etatPilulierOuvert = true;
                this.mettreAJourBoutonsPilulier();
                alert("Le pilulier a été ouvert pour votre médicament. Il se fermera automatiquement après 1 minute.");
            } else {
                // Gérer le cas pilulier déjà ouvert ou autre erreur
                if (reponse.estDejaOuvert) {
                    this.etatPilulierOuvert = true;
                    alert("Le pilulier est déjà ouvert. Il se fermera automatiquement après 1 minute.");
                } else {
                    alert("Erreur lors de l'ouverture programmée : " + (reponse.message || "Inconnue"));
                }
                this.mettreAJourBoutonsPilulier();
            }
        } catch (err) {
            console.error("Erreur lors de l'ouverture programmée du pilulier:", err);
            alert("Une erreur est survenue lors de l'ouverture du pilulier.");
        }
    }
    
    // ---------------------------------------------------------------------
    // MESSAGERIE
    // ---------------------------------------------------------------------
    
    /**
     * Récupère la liste de tous les médecins (estMedecin=true), puis appelle afficherListeContactsMessages() pour remplir la liste de contacts.
     */
    async chargerMedecins() {
        try {
            const reponse = await ClientAPI.obtenirUtilisateurs(true);
            if (reponse.succes) {
                this.medecins = reponse.utilisateurs;
                this.afficherListeContactsMessages();
            }
        } catch (err) {
            console.error("Erreur lors du chargement des médecins:", err);
        }
    }
    
    /**
     * Affiche la liste de médecins comme des "contacts" pour discuter, dans this.listeMessages.
     */
    afficherListeContactsMessages() {
        if (!this.listeMessages) return;
        this.listeMessages.innerHTML = '';
        
        if (this.medecins.length === 0) {
            this.listeMessages.innerHTML = '<p>Aucun médecin disponible.</p>';
            return;
        }
        
        // On crée un div.contact-message pour chaque médecin
        this.medecins.forEach(medecin => {
            const contact = document.createElement('div');
            contact.className = 'contact-message';
            contact.dataset.userId = medecin.id;
            
            const nom = document.createElement('div');
            nom.className = 'nom-contact-message';
            nom.textContent = `Dr. ${medecin.prenom} ${medecin.nom}`;
            
            contact.appendChild(nom);
            contact.addEventListener('click', () => {
                this.afficherConversation(medecin.id, `Dr. ${medecin.prenom} ${medecin.nom}`);
            });
            
            this.listeMessages.appendChild(contact);
        });
    }
    
    /**
     * Affiche le panneau de conversation pour le médecin spécifié, masque la liste de messages.
     */
    afficherConversation(idUtilisateur, nomUtilisateur) {
        this.idUtilisateurConversationActuelle = idUtilisateur;
        if (this.destinataireConversation) {
            this.destinataireConversation.textContent = nomUtilisateur;
        }
        if (this.listeMessages) {
            this.listeMessages.style.display = 'none';
        }
        if (this.conversation) {
            this.conversation.classList.add('active');
            this.conversation.classList.remove('masque');
        }
        this.chargerConversation();
    }
    
    /**
     * Retourne à la liste de médecins (masque la conversation).
     */
    afficherListeMessages() {
        if (this.listeMessages) {
            this.listeMessages.style.display = 'block';
        }
        if (this.conversation) {
            this.conversation.classList.remove('active');
            this.conversation.classList.add('masque');
        }
        this.idUtilisateurConversationActuelle = null;
    }
    
    /**
     * Récupère les messages échangés avec le médecin en cours, puis les affiche.
     */
    async chargerConversation() {
        if (!this.idUtilisateurConversationActuelle) return;
        
        try {
            const reponse = await ClientAPI.obtenirConversation(this.idUtilisateurConversationActuelle);
            if (reponse.succes) {
                this.afficherMessagesConversation(reponse.messages);
            }
        } catch (err) {
            console.error('Erreur de chargement de la conversation:', err);
        }
    }
    
    /**
     * Construit des bulles de message (envoyé ou reçu), n'affiche l'horodatage que pour le dernier message.
     */
    afficherMessagesConversation(messages) {
        if (!this.conteneurMessages) return;
        this.conteneurMessages.innerHTML = '';
        
        if (messages.length === 0) {
            const vide = document.createElement('div');
            vide.className = 'conversation-vide';
            vide.textContent = 'Aucun message. Commencez la conversation !';
            this.conteneurMessages.appendChild(vide);
            return;
        }
        
        const utilisateurActuel = window.gestionnaireAuthentification?.obtenirUtilisateurActuel();
        if (!utilisateurActuel) return;
        
        const dernierIndex = messages.length - 1;
        
        messages.forEach((msg, index) => {
            const bulle = document.createElement('div');
            bulle.classList.add('bulle-message');
            
            // Distinction "envoyé" ou "reçu"
            if (msg.idExpediteur === utilisateurActuel.id) {
                bulle.classList.add('envoye');
            } else {
                bulle.classList.add('recu');
            }
            
            // Contenu du message
            const contenu = document.createElement('div');
            contenu.className = 'contenu-message';
            contenu.textContent = msg.contenu;
            
            bulle.appendChild(contenu);
            
            // On n'affiche l'heure que sur le dernier message
            if (index === dernierIndex) {
                const horodatage = document.createElement('div');
                horodatage.className = 'horodatage-message';
                if (msg.creeLe) {
                    horodatage.textContent = new Date(msg.creeLe).toLocaleString();
                } else {
                    horodatage.textContent = "(Heure inconnue)";
                }
                bulle.appendChild(horodatage);
            }
            
            this.conteneurMessages.appendChild(bulle);
        });
        
        // Scroller en bas
        this.conteneurMessages.scrollTop = this.conteneurMessages.scrollHeight;
    }
    
    /**
     * Envoie le message saisi à l'idUtilisateurConversationActuelle.
     */
    async envoyerMessage() {
        if (!this.idUtilisateurConversationActuelle || !this.champMessage) return;
        
        const texte = this.champMessage.value.trim();
        if (!texte) return;
        
        try {
            const reponse = await ClientAPI.envoyerMessage(this.idUtilisateurConversationActuelle, texte);
            if (reponse.succes) {
                this.champMessage.value = '';
                this.chargerConversation();
            }
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
            alert('Impossible d\'envoyer le message. Réessayez plus tard.');
        }
    }
}