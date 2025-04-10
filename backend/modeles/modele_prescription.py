"""
Fichier : modele_prescription.py
---------------------------------------------------------------------------------------------------------------------
Définit la classe Prescription, représentant l'ordonnance (ou liaison) entre un médecin, un patient et un médicament.
---------------------------------------------------------------------------------------------------------------------
"""

class Prescription:
    def __init__(self, id=None, id_medecin=None, id_patient=None, id_medicament=None, numero_moteur=None, heure_prise=None, actif=True, cree_le=None):
        """
        Initialise une instance de Prescription avec les champs suivants:
          id (int)           : Identifiant unique de la prescription
          id_medecin (int)   : ID du médecin qui a prescrit
          id_patient (int)   : ID du patient destinataire
          id_medicament (int): ID du médicament prescrit
          numero_moteur (int): Compartiment du pilulier (1,2 ou 3 par ex.)
          heure_prise (str)  : Heure de prise (format "HH:MM")
          actif (bool)       : Indique si la prescription est active
          cree_le (str)      : Date/heure de création (timestamp)
        
        Les attributs optionnels:
          nom_medicament (str)   : Nom du médicament (jointure SQL)
          dosage_medicament (str): Dosage du médicament (jointure SQL)
          nom_patient (str)      : Nom complet du patient (jointure SQL)
        """
        self.id = id
        self.id_medecin = id_medecin
        self.id_patient = id_patient
        self.id_medicament = id_medicament
        self.numero_moteur = numero_moteur
        self.heure_prise = heure_prise
        self.actif = actif
        self.cree_le = cree_le

        # Champs supplémentaires, généralement injectés après jointure 
        self.nom_medicament = None
        self.dosage_medicament = None
        self.nom_patient = None
    
    @classmethod
    def depuis_ligne_bdd(cls, ligne):
        """
        Construit une instance Prescription à partir d'une ligne de base de données (sqlite3.Row). Retourne None si 'ligne' est None.
        """
        if ligne is None:
            print("[Prescription] depuis_ligne_bdd -> ligne = None, retour None")
            return None
        
        print("[Prescription] depuis_ligne_bdd -> row =", dict(ligne))
        instance = cls(
            id=ligne['id'],
            id_medecin=ligne['id_medecin'],
            id_patient=ligne['id_patient'],
            id_medicament=ligne['id_medicament'],
            numero_moteur=ligne['numero_moteur'],
            heure_prise=ligne['heure_prise'],
            actif=bool(ligne['actif']),
            cree_le=ligne['cree_le']
        )
        return instance
    
    def vers_dict(self):
        """
        Convertit l'instance Prescription en dictionnaire (par ex. pour un retour JSON à un front-end).
        
        Retour:
         dict contenant les clés principales :
            - id
            - idMedecin
            - idPatient
            - idMedicament
            - numeroMoteur
            - heurePrise
            - actif
            - creeLe
            - nomMedicament
            - dosage_medicament
            - nomPatient
        """
        data = {
            'id': self.id,
            'idMedecin': self.id_medecin,
            'idPatient': self.id_patient,
            'idMedicament': self.id_medicament,
            'numeroMoteur': self.numero_moteur,
            'heurePrise': self.heure_prise,
            'actif': self.actif,
            'creeLe': self.cree_le
        }

        if self.nom_medicament is not None:
            data['nomMedicament'] = self.nom_medicament
        if self.dosage_medicament is not None:
            data['dosage_medicament'] = self.dosage_medicament
        if self.nom_patient is not None:
            data['nomPatient'] = self.nom_patient
        
        print("[Prescription] vers_dict ->", data)
        return data