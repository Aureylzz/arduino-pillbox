"""
Fichier : depot_message.py
--------------------------------------------------------------------------------------------------------
Gère les opérations CRUD (Create, Read, Update, Delete) sur la table 'messages' dans la base de données.

Un message possède :
 - id_expediteur    (l'utilisateur qui envoie)
 - id_destinataire  (celui qui reçoit)
 - contenu          (texte du message)
 - lu               (0 => non lu, 1 => lu)
 - cree_le          (timestamp)

Le modèle 'Message' (modele_message.py) est utilisé pour reconstruire ou manipuler les données.
"""

from backend.utils.db_utils import obtenir_connexion_bdd
from backend.modeles.modele_message import Message

class DepotMessage:
    @staticmethod
    def obtenir_tous():
        """
        Récupère tous les messages (toutes conversations confondues), triés par ordre décroissant de création (cree_le).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            "SELECT * FROM messages ORDER BY cree_le DESC"
        )
        lignes = curseur.fetchall()
        connexion.close()
        return [Message.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_par_id(id_message: int):
        """
        Récupère un message spécifique par son ID unique. Retourne un objet Message ou None si introuvable.
        """
        connexion = obtenir_connexion_bdd()
        ligne = connexion.execute(
            "SELECT * FROM messages WHERE id = ?",
            (id_message,)
        ).fetchone()
        connexion.close()
        return Message.depuis_ligne_bdd(ligne)

    @staticmethod
    def obtenir_conversation(id_utilisateur1: int, id_utilisateur2: int):
        """
        Récupère tous les messages échangés entre deux utilisateurs (dans les deux sens), triés par ordre chronologique de création.
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            """
            SELECT *
              FROM messages
             WHERE (id_expediteur = ? AND id_destinataire = ?)
                OR (id_expediteur = ? AND id_destinataire = ?)
             ORDER BY cree_le
            """,
            (id_utilisateur1, id_utilisateur2, id_utilisateur2, id_utilisateur1)
        )
        lignes = curseur.fetchall()
        connexion.close()
        return [Message.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def obtenir_messages_utilisateur(id_utilisateur: int):
        """
        Récupère tous les messages où l'utilisateur est soit expéditeur, soit destinataire, triés par date décroissante.
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.execute(
            """
            SELECT *
              FROM messages
             WHERE id_expediteur = ?
                OR id_destinataire = ?
             ORDER BY cree_le DESC
            """,
            (id_utilisateur, id_utilisateur)
        )
        lignes = curseur.fetchall()
        connexion.close()
        return [Message.depuis_ligne_bdd(l) for l in lignes]

    @staticmethod
    def creer(message: Message):
        """
        Insère un nouveau message dans la base de données.
        Retourne l'ID du message créé (lastrowid).
        """
        connexion = obtenir_connexion_bdd()
        curseur = connexion.cursor()
        curseur.execute(
            """
            INSERT INTO messages (id_expediteur, id_destinataire, contenu, lu)
            VALUES (?, ?, ?, ?)
            """,
            (
                message.id_expediteur,
                message.id_destinataire,
                message.contenu,
                message.lu
            )
        )
        nouvel_id = curseur.lastrowid
        connexion.commit()
        connexion.close()
        return nouvel_id
    
    @staticmethod
    def marquer_comme_lu(id_message: int):
        """
        Met à jour un message (défini par id_message) pour indiquer qu'il est lu (lu = 1).
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            "UPDATE messages SET lu = 1 WHERE id = ?",
            (id_message,)
        )
        connexion.commit()
        connexion.close()

    @staticmethod
    def marquer_conversation_comme_lue(id_expediteur: int, id_destinataire: int):
        """
        Marque tous les messages envoyés par 'id_expediteur' à 'id_destinataire' comme lus (lu = 1).
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            """
            UPDATE messages
               SET lu = 1
             WHERE id_expediteur = ?
               AND id_destinataire = ?
            """,
            (id_expediteur, id_destinataire)
        )
        connexion.commit()
        connexion.close()

    @staticmethod
    def supprimer(id_message: int):
        """
        Supprime le message correspondant à 'id_message' de la base.
        """
        connexion = obtenir_connexion_bdd()
        connexion.execute(
            "DELETE FROM messages WHERE id = ?",
            (id_message,)
        )
        connexion.commit()
        connexion.close()