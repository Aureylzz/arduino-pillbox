"""
Fichier : modele_utilisateur.py
---------------------------------------------------------------------------------------------------
Définit la classe Utilisateur, représentant un acteur dans le système (de type patient ou médecin).
Chaque objet correspond généralement à une ligne de la table 'utilisateurs' de la base de données.
---------------------------------------------------------------------------------------------------
"""

class Utilisateur:
    def __init__(self, id=None, prenom=None, nom=None, nom_utilisateur=None,
                 mot_de_passe=None, est_medecin=False):
        """
        Initialise un objet Utilisateur avec les champs :
            - id (int)              : Identifiant unique (clé primaire)
            - prenom (str)          : Prénom
            - nom (str)             : Nom de famille
            - nom_utilisateur (str) : Nom d'utilisateur (unique)
            - mot_de_passe (str)    : Mot de passe en clair (projet scolaire !)
            - est_medecin (bool)    : Indique si c'est un médecin (True) ou un patient (False)
        """
        self.id = id
        self.prenom = prenom
        self.nom = nom
        self.nom_utilisateur = nom_utilisateur
        self.mot_de_passe = mot_de_passe
        self.est_medecin = est_medecin
    
    @classmethod
    def depuis_ligne_bdd(cls, ligne):
        """
        Construit un objet Utilisateur à partir d'une ligne de la base de données (sqlite3.Row). Retourne None si 'ligne' est None.
        """
        if ligne is None:
            return None
        return cls(
            id=ligne['id'],
            prenom=ligne['prenom'],
            nom=ligne['nom'],
            nom_utilisateur=ligne['nom_utilisateur'],
            mot_de_passe=ligne['mot_de_passe'],
            est_medecin=bool(ligne['est_medecin'])
        )
    
    def vers_dict(self):
        """
        Convertit l'instance Utilisateur en dictionnaire (pour un retour JSON).
        """
        return {
            'id': self.id,
            'prenom': self.prenom,
            'nom': self.nom,
            'nomUtilisateur': self.nom_utilisateur,
            'estMedecin': self.est_medecin
        }