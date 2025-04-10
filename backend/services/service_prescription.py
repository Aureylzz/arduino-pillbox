"""
Fichier : service_prescription.py
-------------------------------------------------
Service gérant la logique liée aux prescriptions.
-------------------------------------------------
"""

from backend.depots.depot_prescription import DepotPrescription
from backend.modeles.modele_prescription import Prescription

class ServicePrescription:
    @staticmethod
    def lister_toutes_les_prescriptions():
        """
        Retourne la liste de toutes les prescriptions (actives ou non). Affiche un message de log pour le suivi.
        """
        print("[ServicePrescription] lister_toutes_les_prescriptions()")
        return DepotPrescription.obtenir_toutes()
    
    @staticmethod
    def recuperer_prescription_par_id(id_prescription):
        """
        Récupère une prescription précise via son ID. Retourne None si introuvable.
        """
        return DepotPrescription.obtenir_par_id(id_prescription)
    
    @staticmethod
    def lister_prescriptions_patient(id_patient):
        """
        Retourne toutes les prescriptions actives liées à un patient donné, en joignant éventuellement le nom/dosage du médicament.
        """
        return DepotPrescription.obtenir_par_patient(id_patient)
    
    @staticmethod
    def lister_prescriptions_medecin(id_medecin):
        """
        Retourne toutes les prescriptions créées par un médecin (id_medecin), en joignant le nom du patient, le médicament, etc.
        """
        return DepotPrescription.obtenir_par_medecin(id_medecin)
    
    @staticmethod
    def creer_prescription(id_medecin, id_patient, id_medicament, numero_moteur, heure_prise):
        """
        Crée une nouvelle prescription avec les champs requis, et l'insère dans la base. Retourne l'ID créé.
        """
        nouvelle_prescription = Prescription(
            id_medecin=id_medecin,
            id_patient=id_patient,
            id_medicament=id_medicament,
            numero_moteur=numero_moteur,
            heure_prise=heure_prise,
            actif=True
        )
        return DepotPrescription.creer(nouvelle_prescription)
    
    @staticmethod
    def desactiver_prescription(id_prescription):
        """
        Met le champ 'actif' de la prescription à 0 (désactivation), sans la supprimer physiquement.
        """
        DepotPrescription.desactiver(id_prescription)
    
    @staticmethod
    def mettre_a_jour_prescription(id_prescription, id_medecin, id_patient,
                                   id_medicament, numero_moteur, heure_prise, actif):
        """
        Met à jour une prescription existante, si elle existe. Retourne True si la mise à jour a eu lieu, False sinon.
        """
        prescription_existante = DepotPrescription.obtenir_par_id(id_prescription)
        if not prescription_existante:
            return False
        
        prescription_existante.id_medecin = id_medecin
        prescription_existante.id_patient = id_patient
        prescription_existante.id_medicament = id_medicament
        prescription_existante.numero_moteur = numero_moteur
        prescription_existante.heure_prise = heure_prise
        prescription_existante.actif = actif
        
        DepotPrescription.mettre_a_jour(prescription_existante)
        return True
    
    @staticmethod
    def supprimer_prescription(id_prescription):
        """
        Supprime physiquement la prescription de la base (DELETE).
        """
        DepotPrescription.supprimer(id_prescription)
