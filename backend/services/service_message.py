"""
Fichier : service_message.py
---------------------------------------------------------------------------------
Service gérant la logique métier autour des messages échangés entre utilisateurs.
---------------------------------------------------------------------------------
"""

from backend.depots.depot_message import DepotMessage
from backend.modeles.modele_message import Message

class ServiceMessage:
    @staticmethod
    def obtenir_tous_les_messages():
        """
        Retourne l'ensemble des messages existants dans la base (tous utilisateurs confondus).
        """
        return DepotMessage.obtenir_tous()
    
    @staticmethod
    def obtenir_message_par_id(id_message):
        """
        Récupère un message précis via son ID unique.
        """
        return DepotMessage.obtenir_par_id(id_message)
    
    @staticmethod
    def obtenir_conversation(id_utilisateur1, id_utilisateur2):
        """
        Retourne tous les messages échangés (dans les deux sens) entre deux utilisateurs identifiés par id_utilisateur1 et id_utilisateur2.
        """
        return DepotMessage.obtenir_conversation(id_utilisateur1, id_utilisateur2)
    
    @staticmethod
    def obtenir_messages_utilisateur(id_utilisateur):
        """
        Récupère tous les messages où l'utilisateur donné est soit l'expéditeur, soit le destinataire.
        """
        return DepotMessage.obtenir_messages_utilisateur(id_utilisateur)
    
    @staticmethod
    def envoyer_message(id_expediteur, id_destinataire, contenu):
        """
        Crée et insère un nouveau message dans la base. Par défaut, 'lu' est mis à False (non lu). Retourne l'ID du message créé.
        """
        message = Message(
            id_expediteur=id_expediteur,
            id_destinataire=id_destinataire,
            contenu=contenu,
            lu=False
        )
        return DepotMessage.creer(message)
    
    @staticmethod
    def marquer_comme_lu(id_message):
        """
        Marque un message (défini par id_message) comme lu (lu=1).
        """
        DepotMessage.marquer_comme_lu(id_message)
    
    @staticmethod
    def marquer_conversation_comme_lue(id_expediteur, id_destinataire):
        """
        Marque comme lus tous les messages envoyés par 'id_expediteur' à 'id_destinataire'.
        """
        DepotMessage.marquer_conversation_comme_lue(id_expediteur, id_destinataire)
    
    @staticmethod
    def supprimer_message(id_message):
        """
        Supprime physiquement le message correspondant à id_message de la base de données.
        """
        DepotMessage.supprimer(id_message)