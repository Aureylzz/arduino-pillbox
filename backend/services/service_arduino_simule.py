"""
Fichier : service_arduino_simule.py
--------------------------------------------------------------------------------------------------------------
Ce service simule la connexion et le contrôle d'un Arduino pour le pilulier, sans matériel physique.
Il sert à des fins de test ou de développement hors-ligne.

Il imite le comportement d'ouverture/fermeture du pilulier, ainsi que la fermeture automatique après un délai.
--------------------------------------------------------------------------------------------------------------
"""

import time

class ServiceArduinoSimule:
    def __init__(self):
        """
        Initialise l'état du pilulier en 'fermé' et prépare un temps d'ouverture programmée (initialisé à 0).
        """
        self.pilulier_ouvert = False
        self.derniere_ouverture_programmee = 0
    
    def connecter(self):
        """
        Simule la connexion à un Arduino : en réalité, on se contente d'afficher un message et de retourner True.
        """
        print("SIMULATION: Connexion à l'Arduino simulée.")
        return True
    
    def deconnecter(self):
        """
        Simule la déconnexion du matériel Arduino.
        """
        print("SIMULATION: Déconnexion de l'Arduino simulé.")
    
    def envoyer_commande(self, numero_moteur, action):
        """
        Simule l'envoi d'une commande au moteur 'numero_moteur'. Les actions sont 'open' pour ouvrir, 'close' pour fermer.
        """
        action_fr = "ouvert" if action == "open" else "fermé"
        print(f"SIMULATION: Moteur {numero_moteur} {action_fr}")
        
        if action == "open":
            self.pilulier_ouvert = True
        elif action == "close":
            self.pilulier_ouvert = False
        
        return True
    
    def est_pilulier_ouvert(self):
        """
        Retourne l'état du pilulier (True => ouvert, False => fermé).
        """
        return self.pilulier_ouvert
    
    def programmer_fermeture_automatique(self, delai_secondes=60):
        """
        Simule la programmation d'une fermeture automatique. On enregistre le timestamp actuel, puis on renvoie True.
        """
        self.derniere_ouverture_programmee = time.time()
        return True
    
    def verifier_fermeture_automatique(self):
        """
        Vérifie si le délai (60 secondes par défaut) est écoulé depuis la dernière ouverture programmée. Si oui, on simule la fermeture du pilulier.
        """
        if not self.pilulier_ouvert:
            return False
        
        temps_actuel = time.time()
        if (self.derniere_ouverture_programmee > 0
            and temps_actuel - self.derniere_ouverture_programmee >= 60):
            self.pilulier_ouvert = False
            self.derniere_ouverture_programmee = 0
            print("SIMULATION: Fermeture automatique du pilulier après 60 secondes")
            return True
        
        return False