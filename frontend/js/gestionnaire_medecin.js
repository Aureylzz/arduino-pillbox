/**
 * Fichier : gestionnaire_medecin.js
 * ---------------------------------------------------------------------------------------------------------------------------
 * Gère le tableau de bord du Médecin :
 *  - Onglet Prescriptions : Affiche une carte par patient. Quand on clique sur la carte, on déroul la liste de prescriptions.
 *  - Onglet Médicaments : Affichage amélioré : mini-cartes (nom / dosage).
 *  - Onglet Messages : Liste des patients comme "contacts", conversation sélectionnée
 * ---------------------------------------------------------------------------------------------------------------------------
 */

class GestionnaireMedecin {
    constructor() {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCOPE A : RÉFÉRENCES DOM (Éléments HTML)
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        
        // Onglets (pour naviguer entre Prescriptions / Médicaments / Messages)
        this.ongletPrescriptions = document.getElementById('onglet-prescriptions');
        this.ongletMedicaments = document.getElementById('onglet-medicaments-medecin');
        this.ongletMessages = document.getElementById('onglet-messages-medecin');
        
        // Panneaux correspondants (on affiche celui actif, on masque les autres)
        this.panneauPrescriptions = document.getElementById('panneau-prescriptions');
        this.panneauMedicaments = document.getElementById('panneau-medicaments-medecin');
        this.panneauMessages = document.getElementById('panneau-messages-medecin');
        
        // Prescriptions (liste, bouton d'ajout)
        this.listePrescriptionsMedecin = document.getElementById('liste-prescriptions-medecin');
        this.boutonAjouterPrescription = document.getElementById('ajout-prescription');
        
        // Médicaments (liste, bouton d'ajout)
        this.listeMedicaments = document.getElementById('liste-medicaments');
        this.boutonAjouterMedicament = document.getElementById('ajout-medicament');
        
        // Messagerie (liste, conversation, champs de saisie, etc.)
        this.listeMessages = document.getElementById('liste-messages-medecin');
        this.conversation = document.getElementById('conversation-medecin');
        this.destinataireConversation = document.getElementById('destinataire-conversation-medecin');
        this.conteneurMessages = document.getElementById('conteneur-messages-medecin');
        this.champMessage = document.getElementById('champ-message-medecin');
        this.boutonEnvoyerMessage = document.getElementById('bouton-envoyer-message-medecin');
        this.boutonRetourListeMessages = document.getElementById('retour-liste-messages-medecin');
        
        // Fenêtres modales (ajout médicament / ajout prescription)
        this.fenetreModaleMedicament = document.getElementById('fenetre-modale-medicament');
        this.boutonFermerFenetreMedicament = document.getElementById('fermer-fenetre-medicament');
        this.champNomMedicament = document.getElementById('nom-medicament');
        this.champDosageMedicament = document.getElementById('dosage-medicament');
        this.boutonSauverMedicament = document.getElementById('sauver-medicament');
        this.fenetreModalePrescription = document.getElementById('fenetre-modale-prescription');
        this.boutonFermerFenetrePrescription = document.getElementById('fermer-fenetre-prescription');
        this.selectPatientPrescription = document.getElementById('prescription-patient');
        this.selectMedicamentPrescription = document.getElementById('prescription-medicament');
        this.selectMoteurPrescription = document.getElementById('prescription-moteur');
        this.champHeurePrescription = document.getElementById('prescription-heure');
        this.boutonSauverPrescription = document.getElementById('sauver-prescription');
        
        // État local (données chargées depuis l'API)
        this.prescriptions = [];  // toutes les prescriptions du médecin
        this.medicaments = [];
        this.patients = [];
        
        // ID utilisateur sur lequel on discute en messagerie
        this.idUtilisateurConversationActuelle = null;
        
        // Attacher les événements (boutons / onglets / modales / etc.)
        this.attacherEvenements();
    }
    
    /**
     * Attache tous les événements (clic sur onglet, bouton "ajout...", etc.).
     */
    attacherEvenements() {
        // Navigation entre onglets "Prescriptions", "Médicaments", "Messages"
        if (this.ongletPrescriptions) {
            this.ongletPrescriptions.addEventListener('click', () => {
                this.changerOnglet('prescriptions');
            });
        }
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
        
        // Bouton "Ajouter médicament"
        if (this.boutonAjouterMedicament) {
            this.boutonAjouterMedicament.addEventListener('click', () => {
                this.afficherFenetreMedicament();
            });
        }
        
        // Bouton "Ajouter prescription"
        if (this.boutonAjouterPrescription) {
            this.boutonAjouterPrescription.addEventListener('click', () => {
                this.afficherFenetrePrescription();
            });
        }
        
        // Fermeture modale (médicament)
        if (this.boutonFermerFenetreMedicament) {
            this.boutonFermerFenetreMedicament.addEventListener('click', () => {
                this.masquerFenetreMedicament();
            });
        }
        
        // Fermeture modale (prescription)
        if (this.boutonFermerFenetrePrescription) {
            this.boutonFermerFenetrePrescription.addEventListener('click', () => {
                this.masquerFenetrePrescription();
            });
        }
        
        // Sauver médicament
        if (this.boutonSauverMedicament) {
            this.boutonSauverMedicament.addEventListener('click', () => {
                this.enregistrerMedicament();
            });
        }
        
        // Sauver prescription
        if (this.boutonSauverPrescription) {
            this.boutonSauverPrescription.addEventListener('click', () => {
                this.enregistrerPrescription();
            });
        }
        
        // Messagerie (envoyer message, retour à la liste, etc.)
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
            // Envoyer message si l'utilisateur tape Enter (sans Shift)
            this.champMessage.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.envoyerMessage();
                }
            });
        }
    }
    
    /**
     * Permet de basculer l'interface entre
     *  - 'prescriptions'
     *  - 'medicaments'
     *  - 'messages'
     */
    changerOnglet(onglet) {
        // Active visuellement l'onglet choisi
        this.ongletPrescriptions.classList.toggle('actif', onglet === 'prescriptions');
        this.ongletMedicaments.classList.toggle('actif', onglet === 'medicaments');
        this.ongletMessages.classList.toggle('actif', onglet === 'messages');
        
        // Affiche/masque les panneaux
        this.panneauPrescriptions.classList.toggle('actif', onglet === 'prescriptions');
        this.panneauPrescriptions.classList.toggle('masque', onglet !== 'prescriptions');
        this.panneauMedicaments.classList.toggle('actif', onglet === 'medicaments');
        this.panneauMedicaments.classList.toggle('masque', onglet !== 'medicaments');
        this.panneauMessages.classList.toggle('actif', onglet === 'messages');
        this.panneauMessages.classList.toggle('masque', onglet !== 'messages');
        
        // Si on vient d'ouvrir l'onglet "messages", on charge la liste de patients
        if (onglet === 'messages') {
            this.chargerPatients();
        }
    }
    
    /**
     * Charge en parallèle :
     *  - les prescriptions du médecin
     *  - les médicaments
     *  - la liste des patients (utile pour la messagerie, etc.)
     */
    async chargerDonnees() {
        await Promise.all([
            this.chargerPrescriptions(),
            this.chargerMedicaments(),
            this.chargerPatients()
        ]);
    }
    
    /**
     * Fait un appel API pour récupérer les prescriptions du médecin. Puis appelle afficherPrescriptionsParPatient().
     */
    async chargerPrescriptions() {
        try {
            const reponse = await ClientAPI.obtenirPrescriptions();
            if (reponse.succes) {
                this.prescriptions = reponse.prescriptions;
                this.afficherPrescriptionsParPatient();
            }
        } catch (err) {
            console.error('Erreur de chargement des prescriptions (médecin):', err);
        }
    }
    
    /**
     * Récupère la liste des médicaments disponibles, et appelle afficherMedicaments() pour le rendu.
     */
    async chargerMedicaments() {
        try {
            const reponse = await ClientAPI.obtenirMedicaments();
            if (reponse.succes) {
                this.medicaments = reponse.medicaments;
                this.afficherMedicaments();
            }
        } catch (err) {
            console.error('Erreur de chargement des médicaments (médecin):', err);
        }
    }
    
    /**
     * Récupère la liste de tous les patients (estMedecin=false). Met ensuite à jour la fenêtre de prescription et la liste de contacts.
     */
    async chargerPatients() {
        try {
            const reponse = await ClientAPI.obtenirUtilisateurs(false); // false => patients
            if (reponse.succes) {
                this.patients = reponse.utilisateurs;
                // Mettre à jour la fenêtre de prescription (selectPatient) 
                this.remplirFenetrePrescription();
                // Mettre à jour la liste de contacts en messagerie
                this.afficherListeContactsMessages();
            }
        } catch (err) {
            console.error('Erreur de chargement des patients:', err);
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //   1) PRESCRIPTIONS : AFFICHAGE PAR PATIENT
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    /**
     * Groupe les prescriptions par "idPatient" et crée une "carte-patient" pour chacune.
     */
    afficherPrescriptionsParPatient() {
        if (!this.listePrescriptionsMedecin) return;
        this.listePrescriptionsMedecin.innerHTML = '';
        
        if (this.prescriptions.length === 0) {
            this.listePrescriptionsMedecin.innerHTML = '<p>Aucune prescription.</p>';
            return;
        }
        
        // On regroupe sous forme d'objet { [idPatient] : { nomPatient, prescriptions: [...] } }
        const groupes = {};
        this.prescriptions.forEach(p => {
            const pid = p.idPatient;
            if (!groupes[pid]) {
                groupes[pid] = {
                    nomPatient: p.nomPatient || 'Patient inconnu',
                    prescriptions: []
                };
            }
            groupes[pid].prescriptions.push(p);
        });
        
        // On itère sur chaque groupe (patient)
        Object.entries(groupes).forEach(([idPatient, dataPatient]) => {
            const { nomPatient, prescriptions } = dataPatient;
            
            // Création d'une div "carte-patient"
            const carte = document.createElement('div');
            carte.className = 'carte-patient';
            
            // En-tête (nom du patient), cliquable pour dérouler
            const enTete = document.createElement('div');
            enTete.className = 'en_tete-patient';
            enTete.textContent = nomPatient;
            enTete.addEventListener('click', () => {
                contenuPrescriptions.classList.toggle('masque');
            });
            carte.appendChild(enTete);
            
            // Contenu (liste de prescriptions) masqué par défaut
            const contenuPrescriptions = document.createElement('div');
            contenuPrescriptions.className = 'contenu-patient-prescriptions masque';
            
            if (prescriptions.length === 0) {
                contenuPrescriptions.innerHTML = '<p>Aucune prescription pour ce patient.</p>';
            } else {
                // On affiche chaque prescription
                prescriptions.forEach(pr => {
                    const item = document.createElement('div');
                    item.className = 'item-prescription';
                    
                    // Affichage type "NomMedicament (dosage) - compartiment X - heure Y"
                    const dosage = pr.dosage_medicament || '';
                    item.textContent = `${pr.nomMedicament || 'Médicament'} (${dosage}) - Compartiment ${pr.numeroMoteur} - Heure ${pr.heurePrise}`;
                    
                    if (pr.actif) {
                        // Si la prescription est active, on peut la désactiver
                        const btnDesactiver = document.createElement('button');
                        btnDesactiver.className = 'desactiver';
                        btnDesactiver.textContent = 'Désactiver';
                        btnDesactiver.addEventListener('click', () => {
                            this.desactiverPrescription(pr.id);
                        });
                        item.appendChild(btnDesactiver);
                    } else {
                        // Sinon, on indique qu'elle est inactive
                        const inactifBadge = document.createElement('span');
                        inactifBadge.className = 'badge-inactif';
                        inactifBadge.textContent = '(Inactif)';
                        item.appendChild(inactifBadge);
                    }
                    
                    contenuPrescriptions.appendChild(item);
                });
            }
            
            carte.appendChild(contenuPrescriptions);
            this.listePrescriptionsMedecin.appendChild(carte);
        });
    }
    
    /**
     * Affiche une confirmation, puis appelle l'API pour mettre actif=0. Recharge ensuite la liste de prescriptions.
     * @param {number} idPrescription
     */
    async desactiverPrescription(idPrescription) {
        if (!confirm('Voulez-vous vraiment désactiver cette prescription ?')) {
            return;
        }
        try {
            const reponse = await ClientAPI.desactiverPrescription(idPrescription);
            if (reponse.succes) {
                this.chargerPrescriptions(); // on recharge pour MAJ l'affichage
            } else {
                alert('Erreur désactivation : ' + (reponse.message || 'inconnue'));
            }
        } catch (err) {
            console.error('Erreur désactivation prescription:', err);
            alert('Impossible de désactiver la prescription.');
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //   2) MÉDICAMENTS : AFFICHAGE AMÉLIORÉ
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    /**
     * Génère une "mini-carte" pour chaque médicament (nom + dosage). 
     */
    afficherMedicaments() {
        if (!this.listeMedicaments) return;
        this.listeMedicaments.innerHTML = '';
        
        if (this.medicaments.length === 0) {
            this.listeMedicaments.innerHTML = '<p>Aucun médicament.</p>';
            return;
        }
        
        this.medicaments.forEach(m => {
            const carteMed = document.createElement('div');
            carteMed.className = 'carte-medicament-amelioree';
            
            // Titre = nom
            const nom = document.createElement('h4');
            nom.textContent = m.nom || 'Nom inconnu';
            carteMed.appendChild(nom);
            
            // Dosage
            const dosage = document.createElement('p');
            dosage.className = 'dosage-medicament';
            dosage.textContent = "Dosage : " + (m.dosage || 'Dosage inconnu');
            carteMed.appendChild(dosage);
            
            this.listeMedicaments.appendChild(carteMed);
        });
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //   3) FENÊTRES MODALES (ajout médicament / prescription)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    /**
     * Affiche la modale d'ajout de médicament, réinitialise les champs.
     */
    afficherFenetreMedicament() {
        if (this.fenetreModaleMedicament) {
            this.fenetreModaleMedicament.classList.add('active');
            this.fenetreModaleMedicament.classList.remove('masque');
        }
        if (this.champNomMedicament) this.champNomMedicament.value = '';
        if (this.champDosageMedicament) this.champDosageMedicament.value = '';
    }
    
    /**
     * Cache la modale d'ajout de médicament.
     */
    masquerFenetreMedicament() {
        if (this.fenetreModaleMedicament) {
            this.fenetreModaleMedicament.classList.remove('active');
            this.fenetreModaleMedicament.classList.add('masque');
        }
    }
    
    /**
     * Envoie une requête pour créer un nouveau médicament. Recharge la liste des médicaments en cas de succès.
     */
    async enregistrerMedicament() {
        const nom = this.champNomMedicament.value.trim();
        const dosage = this.champDosageMedicament.value.trim();
        
        if (!nom || !dosage) {
            alert('Veuillez remplir tous les champs pour le médicament.');
            return;
        }
        
        try {
            const reponse = await ClientAPI.creerMedicament(nom, dosage);
            if (reponse.succes) {
                this.masquerFenetreMedicament();
                this.chargerMedicaments();
            } else {
                alert('Erreur lors de la création du médicament : ' + (reponse.message || 'inconnue'));
            }
        } catch (err) {
            console.error('Erreur de création médicament:', err);
            alert('Erreur lors de la sauvegarde du médicament.');
        }
    }
    
    /**
     * Affiche la modale d'ajout de prescription, réinitialise l'heure de prise, etc.
     */
    afficherFenetrePrescription() {
        if (this.fenetreModalePrescription) {
            this.fenetreModalePrescription.classList.add('active');
            this.fenetreModalePrescription.classList.remove('masque');
        }
        if (this.champHeurePrescription) {
            this.champHeurePrescription.value = '';
        }
        this.remplirFenetrePrescription();
    }
    
    /**
     * Cache la modale d'ajout de prescription.
     */
    masquerFenetrePrescription() {
        if (this.fenetreModalePrescription) {
            this.fenetreModalePrescription.classList.remove('active');
            this.fenetreModalePrescription.classList.add('masque');
        }
    }
    
    /**
     * Alimente les <select> dans la modale (patients, médicaments).
     */
    remplirFenetrePrescription() {
        if (!this.selectPatientPrescription || !this.selectMedicamentPrescription) return;
        
        // Vider les listes
        this.selectPatientPrescription.innerHTML = '';
        this.selectMedicamentPrescription.innerHTML = '';
        
        // Ajouter la liste de patients
        this.patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.prenom} ${p.nom}`;
            this.selectPatientPrescription.appendChild(opt);
        });
        
        // Ajouter la liste de médicaments
        this.medicaments.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.nom} (${m.dosage})`;
            this.selectMedicamentPrescription.appendChild(opt);
        });
    }
    
    /**
     * Crée une nouvelle prescription via l'API, puis recharge la liste.
     */
    async enregistrerPrescription() {
        const idPatient = this.selectPatientPrescription.value;
        const idMedicament = this.selectMedicamentPrescription.value;
        const numeroMoteur = this.selectMoteurPrescription.value;
        const heure = this.champHeurePrescription.value;
        
        if (!idPatient || !idMedicament || !numeroMoteur || !heure) {
            alert('Veuillez remplir tous les champs de la prescription.');
            return;
        }
        
        try {
            const reponse = await ClientAPI.creerPrescription(
                idPatient, idMedicament, numeroMoteur, heure
            );
            if (reponse.succes) {
                this.masquerFenetrePrescription();
                this.chargerPrescriptions();
            } else {
                alert('Erreur création prescription : ' + (reponse.message || 'inconnue'));
            }
        } catch (err) {
            console.error('Erreur création prescription:', err);
            alert('Erreur lors de la création de la prescription.');
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //   4) MESSAGERIE : Liste de patients, conversation, envoi de message
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    /**
     * Affiche la liste des patients comme des "contacts" dans la partie messagerie.
     */
    afficherListeContactsMessages() {
        if (!this.listeMessages) return;
        this.listeMessages.innerHTML = '';
        
        if (this.patients.length === 0) {
            this.listeMessages.innerHTML = '<p>Aucun patient.</p>';
            return;
        }
        
        // Un <div> par patient
        this.patients.forEach(patient => {
            const contact = document.createElement('div');
            contact.className = 'contact-message';
            contact.dataset.userId = patient.id;
            
            const nom = document.createElement('div');
            nom.className = 'nom-contact-message';
            nom.textContent = `${patient.prenom} ${patient.nom}`;
            
            contact.appendChild(nom);
            contact.addEventListener('click', () => {
                this.afficherConversation(patient.id, `${patient.prenom} ${patient.nom}`);
            });
            
            this.listeMessages.appendChild(contact);
        });
    }
    
    /**
     * Affiche la conversation entre le médecin et ce patient.
     * @param {number} idUtilisateur   - l'ID du patient 
     * @param {string} nomUtilisateur  - nom affiché
     */
    afficherConversation(idUtilisateur, nomUtilisateur) {
        this.idUtilisateurConversationActuelle = idUtilisateur;
        this.destinataireConversation.textContent = nomUtilisateur;
        
        // On masque la liste des contacts, on montre la convo
        if (this.listeMessages && this.conversation) {
            this.listeMessages.style.display = 'none';
            this.conversation.classList.add('active');
            this.conversation.classList.remove('masque');
        }
        this.chargerConversation();
    }
    
    /**
     * Revient à la liste de patients (contacts), masque la conversation active.
     */
    afficherListeMessages() {
        if (this.listeMessages && this.conversation) {
            this.listeMessages.style.display = 'block';
            this.conversation.classList.remove('active');
            this.conversation.classList.add('masque');
        }
        this.idUtilisateurConversationActuelle = null;
    }
    
    /**
     * Charge la conversation actuelle (entre le médecin et idUtilisateurConversationActuelle) via l'API, puis appelle afficherMessagesConversation().
     */
    async chargerConversation() {
        if (!this.idUtilisateurConversationActuelle) return;
        
        try {
            const reponse = await ClientAPI.obtenirConversation(this.idUtilisateurConversationActuelle);
            if (reponse.succes) {
                this.afficherMessagesConversation(reponse.messages);
            }
        } catch (err) {
            console.error("Erreur de chargement conversation (médecin):", err);
        }
    }
    
    /**
     * Met à jour le conteneur des messages en créant une "bulle" pour chacun.
     * @param {Array} messages 
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
        
        // On récupère l'utilisateur actuel pour savoir qui a envoyé
        const utilisateurActuel = window.gestionnaireAuthentification?.obtenirUtilisateurActuel();
        if (!utilisateurActuel) return;
        
        messages.forEach(msg => {
            const bulle = document.createElement('div');
            bulle.classList.add('bulle-message');
            
            // Si c'est l'utilisateur actuel qui a envoyé => .envoye
            // Sinon => .recu
            if (msg.idExpediteur === utilisateurActuel.id) {
                bulle.classList.add('envoye');
            } else {
                bulle.classList.add('recu');
            }
            
            const contenu = document.createElement('div');
            contenu.className = 'contenu-message';
            contenu.textContent = msg.contenu;
            
            const horodatage = document.createElement('div');
            horodatage.className = 'horodatage-message';
            horodatage.textContent = new Date(msg.creeLe).toLocaleString();
            
            bulle.appendChild(contenu);
            bulle.appendChild(horodatage);
            this.conteneurMessages.appendChild(bulle);
        });
        
        // Scroller en bas pour voir le dernier message
        this.conteneurMessages.scrollTop = this.conteneurMessages.scrollHeight;
    }
    
    /**
     * Envoie un message (contenu de champMessage) au patient sélectionné.
     */
    async envoyerMessage() {
        if (!this.champMessage || !this.idUtilisateurConversationActuelle) return;
        
        const contenu = this.champMessage.value.trim();
        if (!contenu) return;
        
        try {
            const reponse = await ClientAPI.envoyerMessage(this.idUtilisateurConversationActuelle, contenu);
            if (reponse.succes) {
                // Nettoyer le champ et recharger la conversation
                this.champMessage.value = '';
                this.chargerConversation();
            }
        } catch (err) {
            console.error("Erreur d'envoi message (médecin):", err);
            alert("Erreur lors de l'envoi du message.");
        }
    }
}