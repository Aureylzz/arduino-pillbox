"""
Fichier : config.py
-----------------------------------------------------------------------------------------------------------------------------------------
Ce fichier définit la classe de configuration "Config" pour l'application.

Il précise notamment :
 - Le chemin de la base de données (CHEMIN_BDD)
 - Le chemin du fichier de schéma SQL (CHEMIN_SCHEMA)
 - Divers paramètres pour la session, la connexion à l'Arduino, etc.

La fonction obtenir_config() renvoie simplement une instance de Config, ce qui permet d'accéder à ces constantes depuis le reste du code.
"""

import os

class Config:
    # On définit ici le répertoire de base, en remontant d'un cran (chemin absolu du dossier 'backend', par exemple).
    REPERTOIRE_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    # Chemin complet de la base de données SQLite
    CHEMIN_BDD = os.path.join(REPERTOIRE_BASE, 'bdd', 'pilulier.db')

    # Chemin vers le script SQL qui contient la structure (tables, etc.)
    CHEMIN_SCHEMA = os.path.join(REPERTOIRE_BASE, 'bdd', 'schema.sql')

    # Clé secrète pour Flask (session, etc.)
    CLE_SECRETE = 'cle_secrete_pilulier'

    # Type de session Flask (ici "filesystem", stockée sur le disque)
    TYPE_SESSION = 'filesystem'

    # Mode debug (True = affichage des messages d’erreur détaillés)
    MODE_DEBUG = True

    # Paramètres Flask : hôte et port d’écoute
    HOTE = '0.0.0.0'
    PORT = 5000

    # Ports Arduino par défaut, selon l’OS
    PORT_ARDUINO_DEFAUT_WINDOWS = 'COM3'
    PORT_ARDUINO_DEFAUT_LINUX = '/dev/ttyACM0'

    # Vitesse de communication série (baud rate) avec l’Arduino
    VITESSE_ARDUINO = 9600

    # Délais (en secondes) pour l'initialisation et le timeout
    DELAI_TIMEOUT_ARDUINO = 1
    DELAI_INITIALISATION_ARDUINO = 2
    DELAI_ATTENTE_REPONSE_ARDUINO = 5

def obtenir_config():
    """
    Retourne une instance de Config. Ainsi, d’autres modules peuvent récupérer les constantes et chemins de configuration.
    """
    return Config()
