"""
Fichier : modele_message.py
----------------------------------------------------------------------------------------------------------------------------
Définit la classe Message, qui représente un échange textuel entre deux utilisateurs (par exemple un patient et un médecin).
----------------------------------------------------------------------------------------------------------------------------
"""

class Message:
    """
    Modèle Message représentant un message entre deux utilisateurs.

    Attributs:
      id (int)                  : Identifiant unique du message
      id_expediteur (int)       : ID de l'utilisateur qui envoie le message
      id_destinataire (int)     : ID de l'utilisateur qui reçoit le message
      contenu (str)             : Texte du message
      lu (bool)                 : Indique si le message a été lu (False => non lu)
      cree_le (str)             : Timestamp de création (ex: "2025-04-12 16:30:00")
      nom_expediteur (str)      : Nom complet de l'expéditeur (optionnel)
      nom_destinataire (str)    : Nom complet du destinataire (optionnel)
    """
    def __init__(self, id=None, id_expediteur=None, id_destinataire=None, contenu=None, lu=False, cree_le=None):
        self.id = id
        self.id_expediteur = id_expediteur
        self.id_destinataire = id_destinataire
        self.contenu = contenu
        self.lu = lu
        self.cree_le = cree_le
        self.nom_expediteur = None
        self.nom_destinataire = None
    
    @classmethod
    def depuis_ligne_bdd(cls, ligne):
        """
        Construit un objet Message à partir d'une ligne de base de données (sqlite3.Row). Retourne None si la ligne est vide (None).

        Paramètre:
          ligne (sqlite3.Row): ligne issue d'un fetchone() ou fetchall()

        Retour:
          Message ou None
        """
        if ligne is None:
            return None
        return cls(
            id=ligne['id'],
            id_expediteur=ligne['id_expediteur'],
            id_destinataire=ligne['id_destinataire'],
            contenu=ligne['contenu'],
            lu=bool(ligne['lu']),
            cree_le=ligne['cree_le']
        )
    
    def vers_dict(self):
        """
        Convertit l'instance de Message en un dictionnaire (pour un envoi JSON, par exemple).

        Retour:
          dict contenant les champs :
            'id', 'idExpediteur', 'idDestinataire', 'contenu',
            'lu', 'creeLe', et éventuellement
            'nomExpediteur', 'nomDestinataire' si présents.
        """
        data = {
            'id': self.id,
            'idExpediteur': self.id_expediteur,
            'idDestinataire': self.id_destinataire,
            'contenu': self.contenu,
            'lu': self.lu,
            'creeLe': self.cree_le
        }
        if hasattr(self, 'nom_expediteur') and self.nom_expediteur is not None:
            data['nomExpediteur'] = self.nom_expediteur
        if hasattr(self, 'nom_destinataire') and self.nom_destinataire is not None:
            data['nomDestinataire'] = self.nom_destinataire
        
        return data
