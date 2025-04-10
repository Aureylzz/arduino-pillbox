"""
Fichier : depot_medicament.py
---------------------------------------------------------------------------------------------------------------------------
Ce dépôt gère toutes les opérations CRUD (Create, Read, Update, Delete) sur la table 'medicaments' dans la base de données.
Il utilise le modèle Medicament pour construire ou réinterpréter les données sous forme d'objets Python.
---------------------------------------------------------------------------------------------------------------------------
"""

from backend.utils.db_utils import obtenir_connexion_bdd
from backend.modeles.modele_medicament import Medicament

class DepotMedicament:
    @staticmethod
    def obtenir_tous():
        """
        Récupère tous les médicaments de la table 'medicaments'. Retourne une liste d'objets Medicament.
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute("SELECT * FROM medicaments")
        lignes = curseur.fetchall()
        connexion.close()
        return [Medicament.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_par_id(id_medicament: int):
        """
        Récupère un médicament en particulier (via son id). Retourne un objet Medicament ou None si introuvable.
        """
        connexion = obtenir_connexion_bdd()
        ligne = connexion.execute(
            "SELECT * FROM medicaments WHERE id = ?",
            (id_medicament,)
        ).fetchone()
        connexion.close()
        return Medicament.depuis_ligne_bdd(ligne)

    @staticmethod
    def obtenir_par_medecin(id_medecin: int):
        """
        Récupère tous les médicaments créés par un médecin spécifique (identifié par son id).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            "SELECT * FROM medicaments WHERE cree_par = ?",
            (id_medecin,)
        )
        lignes = curseur.fetchall()
        connexion.close()
        return [Medicament.depuis_ligne_bdd(l) for l in lignes]
    
    @staticmethod
    def creer(medicament: Medicament):
        """
        Insère un nouveau médicament dans la table. Retourne l'id créé (autoincrémenté par la BD).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.cursor()
        curseur.execute(
            """INSERT INTO medicaments (nom, dosage, cree_par)
               VALUES (?, ?, ?)""",
            (
                medicament.nom,
                medicament.dosage,
                medicament.cree_par
            )
        )
        nouvel_id = curseur.lastrowid
        connexion.commit()
        connexion.close()
        return nouvel_id
    
    @staticmethod
    def mettre_a_jour(medicament: Medicament):
        """
        Met à jour un médicament existant dans la base. Le champ 'id' de l'objet Medicament doit être valide.
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            """
            UPDATE medicaments
               SET nom = ?,
                   dosage = ?,
                   cree_par = ?
             WHERE id = ?
            """,
            (
                medicament.nom,
                medicament.dosage,
                medicament.cree_par,
                medicament.id
            )
        )
        connexion.commit()
        connexion.close()
    
    @staticmethod
    def supprimer(id_medicament: int):
        """
        Supprime un médicament de la table 'medicaments' en fonction de son id.
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            "DELETE FROM medicaments WHERE id = ?",
            (id_medicament,)
        )
        connexion.commit()
        connexion.close()