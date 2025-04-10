-- ==============================================================================================================
-- Fichier : schema.sql
-- ==============================================================================================================
-- Ce script crée la structure de la base de données pour le pilulier.
--
-- Il contient :
--  - La table des utilisateurs (patients et médecins)
--  - La table des médicaments
--  - La table des prescriptions
--  - La table des messages
--
-- À exécuter lors de l'initialisation de la base.
-- ==============================================================================================================

-- --------------------------------------------------------------------------------------------------------------
-- Table : utilisateurs
-- --------------------------------------------------------------------------------------------------------------
-- Contient toutes les personnes enregistrées dans le système, qu'elles soient médecins ou patients.
--      → 'est_medecin' est un bool indiquant si l'utilisateur est un médecin (1) ou un patient (0).
--      → 'mot_de_passe'
-- --------------------------------------------------------------------------------------------------------------
CREATE TABLE utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    nom_utilisateur TEXT NOT NULL UNIQUE,
    mot_de_passe TEXT NOT NULL,
    est_medecin BOOLEAN NOT NULL
);

-- --------------------------------------------------------------------------------------------------------------
-- Table : medicaments
-- --------------------------------------------------------------------------------------------------------------
-- Représente les médicaments disponibles dans le système.
--      → 'cree_par' fait référence à un médecin qui a créé l'enregistrement de ce médicament.
-- --------------------------------------------------------------------------------------------------------------
CREATE TABLE medicaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    dosage TEXT NOT NULL,
    cree_par INTEGER NOT NULL,
    FOREIGN KEY (cree_par) REFERENCES utilisateurs(id)
);

-- --------------------------------------------------------------------------------------------------------------
-- Table : prescriptions
-- --------------------------------------------------------------------------------------------------------------
-- Décrit la relation entre un patient, un médecin, et un médicament.
-- On trouve aussi le numéro de moteur correspondant dans le pilulier, l'heure de prise et l'état 'actif' ou non.
--
--      → 'numero_moteur' doit être entre 1 et 3 pour une version avec plus de moteur. Sur cet exercice on met 1.
--      → 'heure_prise' est un TEXT ici (format "HH:MM").
--      → 'actif' indique si la prescription est encore en cours (1) ou désactivée (0).
--      → 'cree_le' stocke automatiquement un horodatage (CURRENT_TIMESTAMP).
-- --------------------------------------------------------------------------------------------------------------
CREATE TABLE prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_medecin INTEGER NOT NULL,
    id_patient INTEGER NOT NULL,
    id_medicament INTEGER NOT NULL,
    numero_moteur INTEGER NOT NULL CHECK (numero_moteur >= 1 AND numero_moteur <= 3),
    heure_prise TEXT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT 1,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_medecin) REFERENCES utilisateurs(id),
    FOREIGN KEY (id_patient) REFERENCES utilisateurs(id),
    FOREIGN KEY (id_medicament) REFERENCES medicaments(id)
);

-- --------------------------------------------------------------------------------------------------------------
-- Table : messages
-- --------------------------------------------------------------------------------------------------------------
-- Gère la messagerie interne entre patients et médecins.
--  - 'id_expediteur' : l'utilisateur qui envoie le message
--  - 'id_destinataire' : l'utilisateur qui le reçoit
--  - 'contenu' : le texte du message
--  - 'lu' : indique si le message a été lu (0 => non lu, 1 => lu)
--  - 'cree_le' : date/heure de création, par défaut la date/heure courante
-- --------------------------------------------------------------------------------------------------------------
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_expediteur INTEGER NOT NULL,
    id_destinataire INTEGER NOT NULL,
    contenu TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT 0,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_expediteur) REFERENCES utilisateurs(id),
    FOREIGN KEY (id_destinataire) REFERENCES utilisateurs(id)
);