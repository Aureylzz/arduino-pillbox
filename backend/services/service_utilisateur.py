"""
Fichier : service_utilisateur.py
--------------------------------------------------------------------------------
Service gérant la logique métier autour des utilisateurs (patients et médecins).
--------------------------------------------------------------------------------
"""

from backend.depots.depot_utilisateur import DepotUtilisateur
from backend.modeles.modele_utilisateur import Utilisateur

class ServiceUtilisateur:
    @staticmethod
    def lister_tous_les_utilisateurs():
        """
        Retourne la liste de tous les utilisateurs (patients + médecins).
        """
        return DepotUtilisateur.obtenir_tous()
    
    @staticmethod
    def lister_patients():
        """
        Retourne uniquement la liste des utilisateurs qui sont des patients (est_medecin = 0).
        """
        return DepotUtilisateur.obtenir_tous_patients()
    
    @staticmethod
    def lister_medecins():
        """
        Retourne uniquement la liste des utilisateurs qui sont des médecins (est_medecin = 1).
        """
        return DepotUtilisateur.obtenir_tous_medecins()
    
    @staticmethod
    def creer_utilisateur(prenom, nom, nom_utilisateur, mot_de_passe, est_medecin=False):
        """
        Crée un nouvel utilisateur avec les champs fournis. Par défaut, 'est_medecin' est False (patient).
        Retourne l'id de l'utilisateur créé.
        """
        nouvel_utilisateur = Utilisateur(
            prenom=prenom,
            nom=nom,
            nom_utilisateur=nom_utilisateur,
            mot_de_passe=mot_de_passe,
            est_medecin=est_medecin
        )
        return DepotUtilisateur.creer(nouvel_utilisateur)
    
    @staticmethod
    def recuperer_utilisateur_par_id(id_utilisateur):
        """
        Récupère un utilisateur précis via son ID, ou None s'il n'existe pas.
        """
        return DepotUtilisateur.obtenir_par_id(id_utilisateur)
    
    @staticmethod
    def mettre_a_jour_utilisateur(id_utilisateur, prenom, nom, nom_utilisateur,
                                  mot_de_passe, est_medecin):
        """
        Met à jour un utilisateur (existant) selon l'id donné.
        Retourne True si la mise à jour a eu lieu, False si l'utilisateur n'existait pas.
        """
        utilisateur_existant = DepotUtilisateur.obtenir_par_id(id_utilisateur)
        if not utilisateur_existant:
            return False
        
        utilisateur_existant.prenom = prenom
        utilisateur_existant.nom = nom
        utilisateur_existant.nom_utilisateur = nom_utilisateur
        utilisateur_existant.mot_de_passe = mot_de_passe
        utilisateur_existant.est_medecin = est_medecin
        
        DepotUtilisateur.mettre_a_jour(utilisateur_existant)
        return True
    
    @staticmethod
    def supprimer_utilisateur(id_utilisateur):
        """
        Supprime l'utilisateur correspondant à l'id spécifié, définitivement de la base de données.
        """
        DepotUtilisateur.supprimer(id_utilisateur)