"""
Fichier : service_medicament.py
----------------------------------------------------------------------------------------------------------
Ce service gère la logique métier autour des médicaments.
On y crée ou met à jour des Medicament, et on propose des méthodes pour les lister, récupérer par id, etc.
----------------------------------------------------------------------------------------------------------
"""

from backend.depots.depot_medicament import DepotMedicament
from backend.modeles.modele_medicament import Medicament

class ServiceMedicament:
    @staticmethod
    def lister_tous_les_medicaments():
        """
        Retourne la liste de tous les médicaments enregistrés.
        """
        return DepotMedicament.obtenir_tous()
    
    @staticmethod
    def creer_medicament(nom, dosage, id_medecin):
        """
        Crée un nouveau médicament (avec son nom, son dosage) et l'id du médecin qui le crée.
        Retourne l'ID du médicament créé.
        """
        nouveau_medicament = Medicament(nom=nom, dosage=dosage, cree_par=id_medecin)
        return DepotMedicament.creer(nouveau_medicament)
    
    @staticmethod
    def recuperer_medicament_par_id(id_medicament):
        """
        Récupère un médicament précis via son id, ou None s'il n'existe pas.
        """
        return DepotMedicament.obtenir_par_id(id_medicament)
    
    @staticmethod
    def lister_medicaments_par_medecin(id_medecin):
        """
        Retourne tous les médicaments créés par un médecin donné.
        """
        return DepotMedicament.obtenir_par_medecin(id_medecin)
    
    @staticmethod
    def mettre_a_jour_medicament(id_medicament, nom, dosage, id_medecin):
        """
        Met à jour un médicament existant, en changeant son nom, dosage ou créateur (id_medecin).
        Retourne True si la mise à jour a eu lieu, False si le médicament n'existait pas.
        """
        medicament_existant = DepotMedicament.obtenir_par_id(id_medicament)
        if not medicament_existant:
            return False
        
        medicament_existant.nom = nom
        medicament_existant.dosage = dosage
        medicament_existant.cree_par = id_medecin
        DepotMedicament.mettre_a_jour(medicament_existant)
        return True
    
    @staticmethod
    def supprimer_medicament(id_medicament):
        """
        Supprime le médicament correspondant à id_medicament de la base de données.
        """
        DepotMedicament.supprimer(id_medicament)
