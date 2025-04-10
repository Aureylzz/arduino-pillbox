"""
Fichier : peupler_bdd.py
--------------------------------------------------------------------------------------------------------------------------------------------
Ce script permet de peupler la base de données SQLite avec des données initiales (utilisateurs, médicaments, prescriptions, messages, etc.).

Il s'assure que la base de données existe (sinon, il l'initialise). Puis il insère des entrées de test.
"""

import os
from backend.bdd.initialiser_bdd import initialiser_base
from backend.utils.db_utils import obtenir_connexion_bdd
from backend.config.config import obtenir_config

def peupler_base():
    """
    Vérifie si la base de données existe, sinon l'initialise.
    Puis insère des données d'exemple : utilisateurs (patients/médecins), médicaments, prescriptions, messages, etc.
    """
    config = obtenir_config()

    # Si la base n'existe pas, on l'initialise (création des tables via le script SQL)
    if not os.path.exists(config.CHEMIN_BDD):
        initialiser_base()

    # Ouvrir une connexion à la base
    connexion = obtenir_connexion_bdd()
    curseur = connexion.cursor()

    # --- 1) Insérer des utilisateurs ---
    #   - On en crée 5 : 3 patients, 2 médecins
    #   - est_medecin = 0 => patient, 1 => médecin
    utilisateurs = [
        ("Jean",   "Dupont",   "jean.dupont",   "password123", 0),
        ("Marie",  "Martin",   "marie.martin",  "password123", 0),
        ("Pierre", "Bernard",  "pierre.bernard","password123", 0),
        ("Sophie", "Dubois",   "sophie.dubois", "password123", 1),
        ("Thomas", "Leroy",    "thomas.leroy",  "password123", 1)
    ]
    curseur.executemany("""INSERT INTO utilisateurs (prenom, nom, nom_utilisateur, mot_de_passe, est_medecin) VALUES (?, ?, ?, ?, ?)""", utilisateurs)

    # Récupérer la liste des ID des patients (est_medecin=0)
    curseur.execute("SELECT id FROM utilisateurs WHERE est_medecin = 0")
    ids_patients = [row[0] for row in curseur.fetchall()]

    # Récupérer la liste des ID des médecins (est_medecin=1)
    curseur.execute("SELECT id FROM utilisateurs WHERE est_medecin = 1")
    ids_medecins = [row[0] for row in curseur.fetchall()]

    # --- 2) Insérer des médicaments ---
    #   - Chaque médicament est créé par un médecin (id_medecin dans cree_par)
    medicaments = [
        ("Paracétamol",   "500mg",  ids_medecins[0]),
        ("Ibuprofène",    "400mg",  ids_medecins[0]),
        ("Aspirine",      "300mg",  ids_medecins[1]),
        ("Amoxicilline",  "1000mg", ids_medecins[1]),
        ("Levothyroxine", "50mcg",  ids_medecins[0])
    ]
    curseur.executemany("""INSERT INTO medicaments (nom, dosage, cree_par) VALUES (?, ?, ?)""", medicaments)

    # Récupérer la liste de tous les ID de médicaments insérés
    curseur.execute("SELECT id FROM medicaments")
    ids_medicaments = [row[0] for row in curseur.fetchall()]

    # --- 3) Insérer des prescriptions ---
    #   - On utilise les ID médecins/patients/médicaments récupérés plus haut
    prescriptions = [
        (ids_medecins[0], ids_patients[0], ids_medicaments[0], 1, "08:00", 1),  # Dr0 -> Pat0, Med0
        (ids_medecins[0], ids_patients[0], ids_medicaments[1], 2, "12:00", 1),  # Dr0 -> Pat0, Med1
        (ids_medecins[1], ids_patients[1], ids_medicaments[2], 1, "09:00", 1),  # Dr1 -> Pat1, Med2
        (ids_medecins[1], ids_patients[1], ids_medicaments[3], 3, "18:00", 1),  # Dr1 -> Pat1, Med3
        (ids_medecins[0], ids_patients[2], ids_medicaments[4], 2, "07:00", 1),  # Dr0 -> Pat2, Med4
    ]
    curseur.executemany("""INSERT INTO prescriptions (id_medecin, id_patient, id_medicament, numero_moteur, heure_prise, actif) VALUES (?, ?, ?, ?, ?, ?)""", prescriptions)

    # --- 4) Insérer des messages ---
    #   - Représente des échanges entre patients et médecins
    messages = [
        # Pat0 => Dr0
        (ids_patients[0],   ids_medecins[0], "Bonjour Docteur, j'ai commencé à prendre le médicament mais j'ai des maux de tête.", 0),
        
        # Dr0 => Pat0
        (ids_medecins[0],   ids_patients[0], "Bonjour, c'est un effet secondaire possible. Continuez le traitement mais tenez-moi informé.", 1),
        
        # Pat1 => Dr1
        (ids_patients[1],   ids_medecins[1], "Bonjour, puis-je prendre le médicament avec du jus d'orange?", 0),
        
        # Dr1 => Pat1
        (ids_medecins[1],   ids_patients[1], "Bonjour, oui vous pouvez le prendre avec du jus d'orange sans problème.", 1)
    ]
    curseur.executemany("""INSERT INTO messages (id_expediteur, id_destinataire, contenu, lu) VALUES (?, ?, ?, ?)""", messages)

    # Valider les insertions
    connexion.commit()
    connexion.close()

    print("Base de données peuplée avec succès.")

if __name__ == "__main__":
    # Si on exécute ce fichier directement, on lance la fonction de peuplement
    peupler_base()