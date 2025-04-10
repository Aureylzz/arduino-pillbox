"""
Fichier : initialiser_bdd.py
-----------------------------------------------------------------------------------------------------------------------
Ce script permet d'initialiser la base de données SQLite à partir du fichier de schéma (SQL) défini en configuration.

Si la base de données existe déjà, on ignore l'initialisation pour éviter d'écraser des données existantes.
Dans le cas contraire, on exécute le script SQL du schéma et on crée la structure initiale de la base.

Pour l'exécuter directement : python -m backend.bdd.initialiser_bdd

Il va vérifier si le fichier de base de données existe déjà.
S'il n'existe pas, il va lire le schéma (fichier .sql) et créer la base. Sinon, il ne fait rien.
"""

import os

# db_utils contient la fonction pour obtenir la connexion SQLite
from backend.utils.db_utils import obtenir_connexion_bdd
from backend.config.config import obtenir_config


def initialiser_base():
    """
    Vérifie si la base de données existe déjà.
    - Si elle existe, on affiche un message et on n'exécute pas le schéma.
    - Sinon, on lit le schéma (fichier SQL) et on crée la base de données.

    En cas d'erreur, on supprime le fichier de base créé pour laisser l'application dans un état cohérent.
    """
    # Récupérer la configuration globale (chemins, etc.)
    config = obtenir_config()

    # Vérifier si le fichier de base de données existe déjà
    if os.path.exists(config.CHEMIN_BDD):
        print("La base de données existe déjà. Initialisation ignorée.")
        return

    # Créer le dossier parent s'il n'existe pas (ex: backend/bdd/)
    os.makedirs(os.path.dirname(config.CHEMIN_BDD), exist_ok=True)

    # Obtenir la connexion à la base (elle sera créée si elle n'existe pas encore)
    connexion = obtenir_connexion_bdd()
    try:
        # Lire le contenu du fichier SQL (le schéma)
        with open(config.CHEMIN_SCHEMA, 'r', encoding='utf-8') as f:
            script_schema = f.read()

        # Exécuter le script SQL complet
        connexion.executescript(script_schema)

        # Valider (commit) les modifications
        connexion.commit()

        print("Base de données initialisée avec succès.")

    except Exception as e:
        # S'il y a une erreur, on ferme la connexion, et on supprime le fichier de base s'il a été créé.
        print(f"Erreur lors de l'initialisation de la base de données: {e}")
        connexion.close()

        # Supprimer la base si elle vient d'être créée
        if os.path.exists(config.CHEMIN_BDD):
            os.remove(config.CHEMIN_BDD)

        # Réémettre l'exception pour voir la stack trace
        raise

    finally:
        # Fermer la connexion dans tous les cas
        connexion.close()


# Point d'entrée si on exécute ce script directement
if __name__ == "__main__":
    initialiser_base()