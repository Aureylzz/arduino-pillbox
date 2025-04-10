"""
Fichier : service_arduino.py
------------------------------------------------------------------------------------------------------------------------------------------
Ce service gère la connexion série à un Arduino (via un port COM sous Windows), afin de contrôler l'ouverture et la fermeture du pilulier.
Il envoie des commandes JSON indiquant la cible (moteur/pilulier) et l'action (open/close).
------------------------------------------------------------------------------------------------------------------------------------------
"""

import sys
import time
import json
import serial

from backend.config.config import obtenir_config

class ServiceArduino:
    def __init__(self, port=None, vitesse=None):
        """
        Initialise le service. Si aucun 'port' n'est spécifié, on choisit un port par défaut selon la plateforme (Windows ou Linux).

        Paramètres :
          port (str)    : ex. 'COM3' sous Windows, '/dev/ttyACM0' sous Linux
          vitesse (int) : vitesse (baud rate) de la liaison série
        """
        self.config = obtenir_config()
        if not port:
            if 'win' in sys.platform:
                port = self.config.PORT_ARDUINO_DEFAUT_WINDOWS
            else:
                port = self.config.PORT_ARDUINO_DEFAUT_LINUX
        
        self.port = port
        self.vitesse = vitesse or self.config.VITESSE_ARDUINO
        self.connexion_serie = None
        self.pilulier_ouvert = False
        self.derniere_ouverture_programmee = 0
    
    def connecter(self):
        """
        Ouvre la connexion série avec l'Arduino. Retourne True en cas de succès, False sinon.
        """
        try:
            self.connexion_serie = serial.Serial(
                self.port,
                self.vitesse,
                timeout=self.config.DELAI_TIMEOUT_ARDUINO
            )
            time.sleep(self.config.DELAI_INITIALISATION_ARDUINO)
            return True
        except Exception as e:
            print(f"Erreur de connexion à l'Arduino: {e}")
            return False
    
    def deconnecter(self):
        """
        Ferme la connexion série si elle est ouverte.
        """
        if self.connexion_serie:
            self.connexion_serie.close()
            self.connexion_serie = None
    
    def envoyer_commande(self, numero_moteur, action):
        """
        Envoie une commande JSON à l'Arduino via la liaison série. Exemple de commande : {"motor":1, "action":"open"}
        
        Paramètres :
            - numero_moteur (int) : identifie le moteur ou le compartiment
            - action (str)        : "open" ou "close"

        Retour :
            - True  si Arduino renvoie "OK"
            - False sinon (ou en cas d'erreur)
        """
        if not self.connexion_serie:
            print("Aucune connexion série. Veuillez appeler connecter() d'abord.")
            return False
        
        commande = {"motor": numero_moteur, "action": action}
        try:
            # Envoyer la commande au format JSON + "\n"
            self.connexion_serie.write((json.dumps(commande) + "\n").encode())
            temps_debut = time.time()
            reponse = ""

            # Attente d'une réponse de l'Arduino jusqu'à un délai max
            while (time.time() - temps_debut) < self.config.DELAI_ATTENTE_REPONSE_ARDUINO:
                if self.connexion_serie.in_waiting > 0:
                    ligne = self.connexion_serie.readline().decode().strip()
                    reponse += ligne
                    # On sort de la boucle si on lit "OK" ou "ERROR"
                    if "OK" in reponse or "ERROR" in reponse:
                        break
            
            if "OK" in reponse:
                if action == "open":
                    self.pilulier_ouvert = True
                elif action == "close":
                    self.pilulier_ouvert = False
                return True
            
            return False
        except Exception as e:
            print(f"Erreur d'envoi de commande Arduino: {e}")
            return False
    
    def est_pilulier_ouvert(self):
        """
        Retourne True si le pilulier est considéré comme ouvert, False sinon.
        """
        return self.pilulier_ouvert
    
    def programmer_fermeture_automatique(self, delai_secondes=60):
        """
        Enregistre le moment de l'ouverture pour, plus tard, fermer automatiquement le pilulier (après 60s par défaut).
        """
        self.derniere_ouverture_programmee = time.time()
        return True
    
    def verifier_fermeture_automatique(self):
        """
        Vérifie si le pilulier est ouvert depuis au moins 60s (ou delai_secondes si modifié). Si oui, envoie la commande 'close'.
        """
        if not self.pilulier_ouvert:
            return False
        
        temps_actuel = time.time()
        if (self.derniere_ouverture_programmee > 0 and
            temps_actuel - self.derniere_ouverture_programmee >= 60):
            # 60 secondes se sont écoulées, on ferme
            resultat = self.envoyer_commande(1, "close")
            if resultat:
                self.derniere_ouverture_programmee = 0
                return True
        
        return False