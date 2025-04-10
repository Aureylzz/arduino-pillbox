"""
Fichier : service_authentification.py
------------------------------------------------
Service gérant la logique métier d'authentification
et d'autorisation des utilisateurs.
"""

from backend.depots.depot_utilisateur import DepotUtilisateur

class ServiceAuthentification:
    @staticmethod
    def connexion(nom_utilisateur, mot_de_passe):
        """
        Vérifie si le couple (nom_utilisateur, mot_de_passe) est correct.
        Retourne l'objet Utilisateur si OK, sinon None.
        """
        utilisateur = DepotUtilisateur.obtenir_par_nom_utilisateur(nom_utilisateur)
        # Pour un usage réel, on devrait comparer un mot de passe haché.
        if utilisateur and utilisateur.mot_de_passe == mot_de_passe:
            return utilisateur
        return None
