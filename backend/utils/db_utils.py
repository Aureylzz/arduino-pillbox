"""
Fichier : db_utils.py
-----------------------------------------------------------------------------------------------------------------------------------------------
Ce module fournit une fonction utilitaire pour obtenir une connexion à la base de données SQLite, selon le chemin défini dans la configuration.
-----------------------------------------------------------------------------------------------------------------------------------------------
"""

import sqlite3
from backend.config.config import obtenir_config

def obtenir_connexion_bdd():
    """
    Récupère la configuration, puis établit une connexion à la base de données SQLite définie par 'CHEMIN_BDD' dans le fichier config.
    On définit également la 'row_factory' à sqlite3.Row, ce qui permet de récupérer les résultats sous forme d'objets dictionnaires.

    Retour:
      connexion (sqlite3.Connection) : objet de connexion à la base.
    """
    config = obtenir_config()
    connexion = sqlite3.connect(config.CHEMIN_BDD)

    # Permet l'accès aux colonnes par leur nom, ex: ligne["nom_colonne"]
    connexion.row_factory = sqlite3.Row
    return connexion