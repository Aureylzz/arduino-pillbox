"""
Fichier : depot_prescription.py
-----------------------------------------------------------------------------------------------------------------------------
Opérations CRUD (Create, Read, Update, Delete) sur la table 'prescriptions'.
-----------------------------------------------------------------------------------------------------------------------------
Ce dépôt interagit avec la base de données pour gérer :
 - la création de prescriptions,
 - leur mise à jour,
 - leur désactivation ou suppression,
 - et la récupération (pour un médecin ou un patient).
 
Il utilise le modèle Prescription (modele_prescription.py) pour construire ou réinterpréter les lignes obtenues depuis la BD.
"""

from backend.utils.db_utils import obtenir_connexion_bdd
from backend.modeles.modele_prescription import Prescription

class DepotPrescription:
    @staticmethod
    def obtenir_toutes():
        """
        Récupère toutes les prescriptions (actives ou non).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute("SELECT * FROM prescriptions")
        lignes = curseur.fetchall()
        connexion.close()

        print("[DepotPrescription] obtenir_toutes -> nombre de lignes =", len(lignes))
        return [Prescription.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_par_id(id_prescription: int):
        """
        Récupère une prescription spécifique via son id.
        Retourne un objet Prescription ou None si introuvable.
        """
        connexion = obtenir_connexion_bdd()
        ligne = connexion.execute(
            "SELECT * FROM prescriptions WHERE id = ?",
            (id_prescription,)
        ).fetchone()
        connexion.close()

        print(f"[DepotPrescription] obtenir_par_id({id_prescription}) -> ligne =", ligne)
        return Prescription.depuis_ligne_bdd(ligne)

    @staticmethod
    def obtenir_par_patient(id_patient: int):
        """
        Récupère toutes les prescriptions actives d'un patient donné, en rejoignant la table medicaments pour obtenir nom et dosage.
        """
        print(f"[DepotPrescription] obtenir_par_patient({id_patient}) => requête SQL join medicaments")
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            """
            SELECT p.*,
                   m.nom AS nom_medicament,
                   m.dosage AS dosage_medicament
              FROM prescriptions p
              JOIN medicaments m ON p.id_medicament = m.id
             WHERE p.id_patient = ?
               AND p.actif = 1
             ORDER BY p.heure_prise
            """,
            (id_patient,)
        )
        lignes = curseur.fetchall()
        connexion.close()

        print(f"[DepotPrescription] obtenir_par_patient -> nombre de lignes = {len(lignes)}")
        resultats = []
        for i, ligne in enumerate(lignes, start=1):
            print(f"[DepotPrescription] ligne #{i} => {dict(ligne)}")
            prescription = Prescription.depuis_ligne_bdd(ligne)
            # On ajoute nom_medicament et dosage_medicament
            prescription.nom_medicament = ligne["nom_medicament"]
            prescription.dosage_medicament = ligne["dosage_medicament"]
            resultats.append(prescription)
        
        return resultats

    @staticmethod
    def obtenir_par_medecin(id_medecin: int):
        """
        Récupère toutes les prescriptions créées par un médecin (id_medecin).
        Joint la table utilisateurs (pour le nom patient) et medicaments (pour le nom/dosage médicament).
        """
        print(f"[DepotPrescription] obtenir_par_medecin({id_medecin}) => "
              "requête SQL join medicaments + utilisateurs")
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            """
            SELECT p.*,
                   u.prenom AS patient_prenom, u.nom AS patient_nom,
                   m.nom AS nom_medicament, m.dosage AS dosage_medicament
              FROM prescriptions p
              JOIN utilisateurs u ON p.id_patient = u.id
              JOIN medicaments m ON p.id_medicament = m.id
             WHERE p.id_medecin = ?
             ORDER BY p.cree_le DESC
            """,
            (id_medecin,)
        )
        lignes = curseur.fetchall()
        connexion.close()

        print(f"[DepotPrescription] obtenir_par_medecin -> nombre de lignes = {len(lignes)}")
        resultats = []
        for i, ligne in enumerate(lignes, start=1):
            print(f"[DepotPrescription] ligne #{i} => {dict(ligne)}")
            prescription = Prescription.depuis_ligne_bdd(ligne)
            # On ajoute patient_prenom+patient_nom, nom_medicament et dosage
            prescription.nom_patient = f"{ligne['patient_prenom']} {ligne['patient_nom']}"
            prescription.nom_medicament = ligne["nom_medicament"]
            prescription.dosage_medicament = ligne["dosage_medicament"]
            resultats.append(prescription)
        
        return resultats

    @staticmethod
    def creer(prescription: Prescription):
        """
        Crée une nouvelle prescription (INSERT). Retourne l'id (autoincrément) généré.
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.cursor()
        curseur.execute(
            """
            INSERT INTO prescriptions
                   (id_medecin, id_patient, id_medicament, 
                    numero_moteur, heure_prise, actif)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                prescription.id_medecin,
                prescription.id_patient,
                prescription.id_medicament,
                prescription.numero_moteur,
                prescription.heure_prise,
                prescription.actif
            )
        )
        nouvel_id = curseur.lastrowid
        connexion.commit()
        connexion.close()
        print(f"[DepotPrescription] creer -> nouvel_id = {nouvel_id}")
        return nouvel_id

    @staticmethod
    def mettre_a_jour(prescription: Prescription):
        """
        Met à jour une prescription existante (UPDATE). Le champ 'id' doit être valide.
        """
        print(f"[DepotPrescription] mettre_a_jour -> prescription.id = {prescription.id}")
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            """
            UPDATE prescriptions
               SET id_medecin = ?,
                   id_patient = ?,
                   id_medicament = ?,
                   numero_moteur = ?,
                   heure_prise = ?,
                   actif = ?
             WHERE id = ?
            """,
            (
                prescription.id_medecin,
                prescription.id_patient,
                prescription.id_medicament,
                prescription.numero_moteur,
                prescription.heure_prise,
                prescription.actif,
                prescription.id
            )
        )
        connexion.commit()
        connexion.close()

    @staticmethod
    def desactiver(id_prescription: int):
        """
        Met 'actif' à 0 pour la prescription indiquée (désactivation).
        """
        print(f"[DepotPrescription] desactiver -> id_prescription = {id_prescription}")
        connexion = obtenir_connexion_bdd()
        connexion.execute("UPDATE prescriptions SET actif = 0 WHERE id = ?", (id_prescription,))
        connexion.commit()
        connexion.close()

    @staticmethod
    def supprimer(id_prescription: int):
        """
        Supprime physiquement la prescription de la base (DELETE).
        """
        print(f"[DepotPrescription] supprimer -> id_prescription = {id_prescription}")
        connexion = obtenir_connexion_bdd()
        connexion.execute("DELETE FROM prescriptions WHERE id = ?", (id_prescription,))
        connexion.commit()
        connexion.close()