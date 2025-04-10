"""
Fichier : modele_medicament.py
---------------------------------------------------------------------------------------------------------------------
Définit la classe Medicament, représentant un médicament créé par un médecin dans le système de Pilulier Intelligent.

Un objet Medicament correspond généralement à une ligne dans la table 'medicaments' de la base de données.
---------------------------------------------------------------------------------------------------------------------
"""

class Medicament:
    """
    Modèle Medicament représentant un médicament créé par un médecin.

    Attributs:
      id (int)     : Identifiant unique du médicament (clé primaire)
      nom (str)    : Nom du médicament (ex: "Ibuprofène")
      dosage (str) : Dosage (ex: "500mg", "300mg", "50mcg")
      cree_par (int): ID du médecin qui a créé l'enregistrement
    """
    def __init__(self, id=None, nom=None, dosage=None, cree_par=None):
        self.id = id
        self.nom = nom
        self.dosage = dosage
        self.cree_par = cree_par
    
    @classmethod
    def depuis_ligne_bdd(cls, ligne):
        """
        Construit un objet Medicament à partir d'une ligne extraite de la base de données (sqlite3.Row), ou retourne None si la ligne est vide (None).

        Paramètre:
          ligne (sqlite3.Row): ligne issue d'un fetchone() ou fetchall()

        Retour:
          Medicament ou None
        """
        if ligne is None:
            return None
        return cls(
            id=ligne['id'],
            nom=ligne['nom'],
            dosage=ligne['dosage'],
            cree_par=ligne['cree_par']
        )
    
    def vers_dict(self):
        """
        Convertit l'instance de Medicament en dictionnaire, par exemple pour être renvoyée en JSON dans l'API.

        Retour:
          dict contenant les clés: 'id', 'nom', 'dosage', 'creePar'
        """
        return {
            'id': self.id,
            'nom': self.nom,
            'dosage': self.dosage,
            'creePar': self.cree_par
        }