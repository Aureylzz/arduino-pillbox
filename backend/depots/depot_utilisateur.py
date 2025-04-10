"""
Fichier : depot_utilisateur.py
-------------------------------------------------------------------------------------------------------------------------
Opérations CRUD (Create, Read, Update, Delete) sur la table 'utilisateurs' dans la base de données.

On y trouve des méthodes pour :
 - récupérer tous les utilisateurs,
 - récupérer uniquement les patients ou uniquement les médecins,
 - récupérer un utilisateur par ID ou par nom d'utilisateur,
 - créer, mettre à jour ou supprimer un utilisateur.
 
Le modèle 'Utilisateur' (modele_utilisateur.py) est utilisé pour construire ou réinterpréter les lignes issues de la BDD.
-------------------------------------------------------------------------------------------------------------------------
"""

from backend.utils.db_utils import obtenir_connexion_bdd
from backend.modeles.modele_utilisateur import Utilisateur

class DepotUtilisateur:
    @staticmethod
    def obtenir_tous():
        """
        Retourne la liste de tous les utilisateurs (patients et médecins).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute("SELECT * FROM utilisateurs")
        lignes = curseur.fetchall()
        connexion.close()
        return [Utilisateur.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_tous_patients():
        """
        Retourne la liste de tous les patients (est_medecin=0).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute("SELECT * FROM utilisateurs WHERE est_medecin = 0")
        lignes = curseur.fetchall()
        connexion.close()
        return [Utilisateur.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_tous_medecins():
        """
        Retourne la liste de tous les médecins (est_medecin=1).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute("SELECT * FROM utilisateurs WHERE est_medecin = 1")
        lignes = curseur.fetchall()
        connexion.close()
        return [Utilisateur.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_par_id(id_utilisateur):
        """
        Retourne un utilisateur via son ID, ou None s'il n'existe pas.
        """
        connexion = obtenir_connexion_bdd()
        ligne = connexion.execute(
            "SELECT * FROM utilisateurs WHERE id = ?",
            (id_utilisateur,)
        ).fetchone()
        connexion.close()
        return Utilisateur.depuis_ligne_bdd(ligne)
    
    @staticmethod
    def obtenir_par_nom_utilisateur(nom_utilisateur):
        """
        Retourne un utilisateur via son 'nom_utilisateur' (unique).
        Attention : on passe (nom_utilisateur,) pour former une tuple à un élément.
        """
        connexion = obtenir_connexion_bdd()
        ligne = connexion.execute(
            "SELECT * FROM utilisateurs WHERE nom_utilisateur = ?",
            (nom_utilisateur,)
        ).fetchone()
        connexion.close()
        return Utilisateur.depuis_ligne_bdd(ligne)
    
    @staticmethod
    def creer(utilisateur: Utilisateur):
        """
        Insère un nouvel utilisateur en base, et renvoie son ID (lastrowid).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.cursor()
        curseur.execute(
            """
            INSERT INTO utilisateurs 
                   (prenom, nom, nom_utilisateur, mot_de_passe, est_medecin)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                utilisateur.prenom,
                utilisateur.nom,
                utilisateur.nom_utilisateur,
                utilisateur.mot_de_passe,
                utilisateur.est_medecin
            )
        )
        nouvel_id = curseur.lastrowid
        connexion.commit()
        connexion.close()
        return nouvel_id
    
    @staticmethod
    def mettre_a_jour(utilisateur: Utilisateur):
        """
        Met à jour un utilisateur existant, identifié par utilisateur.id.
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            """
            UPDATE utilisateurs
               SET prenom = ?,
                   nom = ?,
                   nom_utilisateur = ?,
                   mot_de_passe = ?,
                   est_medecin = ?
             WHERE id = ?
            """,
            (
                utilisateur.prenom,
                utilisateur.nom,
                utilisateur.nom_utilisateur,
                utilisateur.mot_de_passe,
                utilisateur.est_medecin,
                utilisateur.id
            )
        )
        connexion.commit()
        connexion.close()

    @staticmethod
    def supprimer(id_utilisateur: int):
        """
        Supprime l'utilisateur ayant l'id 'id_utilisateur' de la table.
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            "DELETE FROM utilisateurs WHERE id = ?",
            (id_utilisateur,)
        )
        connexion.commit()
        connexion.close()