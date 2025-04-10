"""
Fichier : app.py
-----------------------------------------------------------------------
Point d'entrée principal de l'application Flask pour le système de pilulier.

Ce fichier crée l'application Flask, configure les routes et lance le serveur pour répondre aux requêtes du front-end.
-----------------------------------------------------------------------
"""

import os
import time
import threading

from flask import Flask, request, jsonify, session, send_from_directory

# Configuration et services
from backend.config.config import obtenir_config
from backend.services.service_authentification import ServiceAuthentification
from backend.services.service_utilisateur import ServiceUtilisateur
from backend.services.service_medicament import ServiceMedicament
from backend.services.service_prescription import ServicePrescription
from backend.services.service_message import ServiceMessage

# Services Arduino (réel ou simulé)
from backend.services.service_arduino import ServiceArduino
from backend.services.service_arduino_simule import ServiceArduinoSimule

# -----------------------------------------------------------------------
#          Initialisation de l'application Flask et de la config
# -----------------------------------------------------------------------
app = Flask(__name__, static_folder="../frontend", static_url_path="")
config = obtenir_config()

# Clé secrète Flask et type de session (filesystem)
app.secret_key = config.CLE_SECRETE
app.config["SESSION_TYPE"] = config.TYPE_SESSION

# Décider si on utilise l'Arduino simulé ou réel
UTILISER_ARDUINO_SIMULE = False

# -----------------------------------------------------------------------
#          Initialisation (ou tentative) du service Arduino
# -----------------------------------------------------------------------
if UTILISER_ARDUINO_SIMULE:
    service_arduino = ServiceArduinoSimule()
    service_arduino.connecter()
    print("Pilulier: utilisation du SERVICE ARDUINO SIMULÉ.")
else:
    service_arduino = ServiceArduino()
    if service_arduino.connecter():
        print("Pilulier: Service Arduino connecté avec succès.")
    else:
        print("Pilulier: Échec de connexion Arduino, utilisation du service simulé.")
        service_arduino = ServiceArduinoSimule()
        service_arduino.connecter()

# -----------------------------------------------------------------------
#   Fonction de vérification périodique de la fermeture automatique
# -----------------------------------------------------------------------
def verification_fermeture_automatique():
    """
    Exécutée dans un thread séparé, elle vérifie régulièrement si le pilulier doit être refermé (après un délai d'ouverture).
    """
    while True:
        service_arduino.verifier_fermeture_automatique()
        time.sleep(5)  # Vérification toutes les 5 secondes

# Lancer le thread de vérification
thread_verification = threading.Thread(
    target=verification_fermeture_automatique,
    daemon=True
)
thread_verification.start()

# -----------------------------------------------------------------------
#                    ROUTES D'AUTHENTIFICATION
# -----------------------------------------------------------------------
@app.route("/api/connexion", methods=["POST"])
def route_connexion():
    """
    Vérifie les identifiants reçus(nomUtilisateur et motDePasse)
    Compare 'estMedecinChoisi' avec la table utilisateurs et refuse la connexion si incohérent.
    """
    data = request.json
    nom_utilisateur = data.get("nomUtilisateur")
    mot_de_passe = data.get("motDePasse")
    est_medecin_choisi = data.get("estMedecinChoisi", False)

    utilisateur = ServiceAuthentification.connexion(nom_utilisateur, mot_de_passe)
    if utilisateur:
        # Vérifier la cohérence médecin/patient
        if utilisateur.est_medecin != est_medecin_choisi:
            print(f"[app] /api/connexion -> incohérence: "
                  f"compte est_medecin={utilisateur.est_medecin}, "
                  f"param={est_medecin_choisi}")
            return jsonify({
                "succes": False,
                "message": "Vous avez sélectionné un type de compte incompatible avec vos identifiants."
            }), 401

        # Sinon, c'est cohérent : on stocke l'ID et le rôle en session
        session["id_utilisateur"] = utilisateur.id
        session["estMedecin"] = utilisateur.est_medecin
        print("[app] /api/connexion -> succès pour", nom_utilisateur,
              f"(medecin={utilisateur.est_medecin})")
        return jsonify({
            "succes": True,
            "utilisateur": utilisateur.vers_dict()
        })
    else:
        print("[app] /api/connexion -> échec pour", nom_utilisateur)
        return jsonify({
            "succes": False,
            "message": "Identifiants invalides"
        }), 401

@app.route("/api/deconnexion", methods=["POST"])
def route_deconnexion():
    """
    Déconnecte l'utilisateur actuel (session.clear()) et renvoie
    {"succes": True}.
    """
    session.clear()
    print("[app] /api/deconnexion -> session.clear()")
    return jsonify({"succes": True})

# -----------------------------------------------------------------------
#                ROUTES DE GESTION DES UTILISATEURS
# -----------------------------------------------------------------------
@app.route("/api/utilisateurs", methods=["GET"])
def route_lister_utilisateurs():
    """
    Retourne la liste des utilisateurs. Permet de filtrer via estMedecin=0 ou estMedecin=1 pour obtenir uniquement patients ou médecins.
    """
    estMedecinStr = request.args.get("estMedecin")
    if estMedecinStr is not None:
        estMedecin = (estMedecinStr == "1" or estMedecinStr.lower() == "true")
        if estMedecin:
            medecins = ServiceUtilisateur.lister_medecins()
            return jsonify({
                "succes": True,
                "utilisateurs": [m.vers_dict() for m in medecins]
            })
        else:
            patients = ServiceUtilisateur.lister_patients()
            return jsonify({
                "succes": True,
                "utilisateurs": [p.vers_dict() for p in patients]
            })
    else:
        tous = ServiceUtilisateur.lister_tous_les_utilisateurs()
        return jsonify({
            "succes": True,
            "utilisateurs": [u.vers_dict() for u in tous]
        })

# -----------------------------------------------------------------------
#               ROUTES DE GESTION DES MÉDICAMENTS
# -----------------------------------------------------------------------
@app.route("/api/medicaments", methods=["GET"])
def route_lister_medicaments():
    """
    Liste tous les médicaments présents en base, renvoie un JSON {"succes": True, "medicaments":[...]}.
    """
    medicaments = ServiceMedicament.lister_tous_les_medicaments()
    return jsonify({
        "succes": True,
        "medicaments": [m.vers_dict() for m in medicaments]
    })

@app.route("/api/medicaments", methods=["POST"])
def route_creer_medicament():
    """
    Crée un nouveau médicament, accessible uniquement au médecin. Reçoit un JSON { nom, dosage }. 
    """
    if "id_utilisateur" not in session or not session.get("estMedecin", False):
        return jsonify({
            "succes": False,
            "message": "Accès refusé : vous n'êtes pas médecin."
        }), 403
    
    data = request.json
    nom = data.get("nom")
    dosage = data.get("dosage")
    
    if not nom or not dosage:
        return jsonify({
            "succes": False,
            "message": "Nom et dosage obligatoires."
        }), 400
    
    id_medecin = session["id_utilisateur"]
    id_medicament = ServiceMedicament.creer_medicament(nom, dosage, id_medecin)
    return jsonify({"succes": True, "idMedicament": id_medicament})

# -----------------------------------------------------------------------
#             ROUTES DE GESTION DES PRESCRIPTIONS
# -----------------------------------------------------------------------
@app.route("/api/prescriptions", methods=["GET"])
def route_lister_prescriptions():
    """
    Si l'utilisateur est médecin => liste les prescriptions qu'il a créées. Si c'est un patient => liste ses prescriptions actives.
    """
    if "id_utilisateur" not in session:
        print("[app] /api/prescriptions -> Non connecté")
        return jsonify({"succes": False, "message": "Non connecté"}), 401
    
    id_utilisateur = session["id_utilisateur"]
    est_medecin = session.get("estMedecin", False)
    
    print(f"[app] /api/prescriptions -> id_utilisateur={id_utilisateur}, estMedecin={est_medecin}")
    
    if est_medecin:
        prescriptions = ServicePrescription.lister_prescriptions_medecin(id_utilisateur)
    else:
        prescriptions = ServicePrescription.lister_prescriptions_patient(id_utilisateur)
    
    print("[app] /api/prescriptions -> prescriptions trouvées :", len(prescriptions))
    for p in prescriptions:
        print("[app]   -", p.vers_dict())
    
    return jsonify({
        "succes": True,
        "prescriptions": [p.vers_dict() for p in prescriptions]
    })

@app.route("/api/prescriptions", methods=["POST"])
def route_creer_prescription():
    """
    Crée une prescription (réservé médecin). Reçoit un JSON {idPatient, idMedicament, numeroMoteur, heurePrise}.
    """
    if "id_utilisateur" not in session or not session.get("estMedecin", False):
        return jsonify({
            "succes": False, 
            "message": "Accès refusé : vous n'êtes pas médecin."
        }), 403
    
    data = request.json
    id_patient = data.get("idPatient")
    id_medicament = data.get("idMedicament")
    numero_moteur = data.get("numeroMoteur")
    heure_prise = data.get("heurePrise")
    
    if not (id_patient and id_medicament and numero_moteur and heure_prise):
        return jsonify({
            "succes": False,
            "message": "Champs manquants"
        }), 400
    
    id_medecin = session["id_utilisateur"]
    id_prescription = ServicePrescription.creer_prescription(
        id_medecin, id_patient, id_medicament, numero_moteur, heure_prise
    )
    return jsonify({"succes": True, "idPrescription": id_prescription})

@app.route("/api/prescriptions/<int:id_prescription>/desactiver", methods=["POST"])
def route_desactiver_prescription(id_prescription):
    """
    Désactive (actif=0) une prescription existante (uniquement médecin).
    """
    if "id_utilisateur" not in session or not session.get("estMedecin", False):
        return jsonify({
            "succes": False, 
            "message": "Accès refusé : vous n'êtes pas médecin."
        }), 403
    
    ServicePrescription.desactiver_prescription(id_prescription)
    return jsonify({"succes": True})

# -----------------------------------------------------------------------
#                     ROUTES DE MESSAGERIE
# -----------------------------------------------------------------------
@app.route("/api/messages", methods=["GET"])
def route_obtenir_messages_utilisateur():
    """
    Retourne tous les messages (envoyés ou reçus) pour l'utilisateur connecté.
    """
    if "id_utilisateur" not in session:
        return jsonify({
            "succes": False, 
            "message": "Non connecté"
        }), 401
    
    id_utilisateur = session["id_utilisateur"]
    messages = ServiceMessage.obtenir_messages_utilisateur(id_utilisateur)
    
    return jsonify({
        "succes": True,
        "messages": [m.vers_dict() for m in messages]
    })

@app.route("/api/conversations/<int:id_autre_utilisateur>", methods=["GET"])
def route_obtenir_conversation(id_autre_utilisateur):
    """
    Retourne la conversation (tous les messages) entre l'utilisateur connecté et 'id_autre_utilisateur'.
    """
    if "id_utilisateur" not in session:
        return jsonify({
            "succes": False,
            "message": "Non connecté"
        }), 401
    
    id_utilisateur = session["id_utilisateur"]
    conversation = ServiceMessage.obtenir_conversation(id_utilisateur, id_autre_utilisateur)
    
    return jsonify({
        "succes": True,
        "messages": [m.vers_dict() for m in conversation]
    })

@app.route("/api/messages", methods=["POST"])
def route_envoyer_message():
    """
    Envoie un nouveau message de l'utilisateur connecté vers un autre utilisateur. Reçoit {idDestinataire, contenu}.
    """
    if "id_utilisateur" not in session:
        return jsonify({
            "succes": False, 
            "message": "Non connecté"
        }), 401
    
    data = request.json
    id_expediteur = session["id_utilisateur"]
    id_destinataire = data.get("idDestinataire")
    contenu = data.get("contenu")
    
    if not id_destinataire or not contenu:
        return jsonify({
            "succes": False,
            "message": "Champs manquants"
        }), 400
    
    id_message = ServiceMessage.envoyer_message(id_expediteur, id_destinataire, contenu)
    return jsonify({
        "succes": True,
        "idMessage": id_message
    })

# -----------------------------------------------------------------------
#           ROUTES DE CONTRÔLE DU PILULIER (ARDUINO)
# -----------------------------------------------------------------------
@app.route("/api/pilulier/controle", methods=["POST"])
def route_controle_pilulier():
    """
    Contrôle le pilulier (ouverture/fermeture). Reçoit un JSON { numeroMoteur, action }, où action = "ouvrir" ou "fermer".
    """
    data = request.json
    numero_moteur = data.get("numeroMoteur", 1)
    action_recue = data.get("action")  # "ouvrir" ou "fermer"
    
    if action_recue not in ["ouvrir", "fermer"]:
        return jsonify({"succes": False, "message": "Action invalide"}), 400
    
    est_ouvert = service_arduino.est_pilulier_ouvert()
    
    # Vérifications : si déjà ouvert, on ne rouvre pas, etc.
    if action_recue == "ouvrir" and est_ouvert:
        return jsonify({
            "succes": False,
            "estDejaOuvert": True,
            "message": "Le pilulier est déjà ouvert."
        })
    if action_recue == "fermer" and not est_ouvert:
        return jsonify({
            "succes": False,
            "estDejaFerme": True,
            "message": "Le pilulier est déjà fermé."
        })
    
    action_arduino = "open" if action_recue == "ouvrir" else "close"
    est_ouverture_programmee = data.get("estProgramme", False)
    
    reussite = service_arduino.envoyer_commande(numero_moteur, action_arduino)
    if reussite:
        # Si c'est une ouverture programmée, on enclenche la fermeture auto
        if est_ouverture_programmee and action_recue == "ouvrir":
            service_arduino.programmer_fermeture_automatique()
        return jsonify({"succes": True})
    else:
        return jsonify({
            "succes": False,
            "message": "Erreur de contrôle du pilulier"
        }), 400

@app.route("/api/pilulier/etat", methods=["GET"])
def route_etat_pilulier():
    """
    Retourne l'état actuel du pilulier (ouvert=True/fermé=False).
    """
    est_ouvert = service_arduino.est_pilulier_ouvert()
    return jsonify({
        "succes": True,
        "estOuvert": est_ouvert
    })

# -----------------------------------------------------------------------
#             ROUTE POUR SERVIR L'INDEX (page d'accueil)
# -----------------------------------------------------------------------
@app.route("/", methods=["GET"])
def route_index():
    """
    Retourne la page index.html pour la partie front-end (fichiers statiques dans ../frontend).
    """
    return send_from_directory("../frontend", "index.html")

# -----------------------------------------------------------------------
#                LANCEMENT DE L'APPLICATION FLASK
# -----------------------------------------------------------------------
if __name__ == "__main__":
    # S'assurer que le dossier 'frontend' existe
    os.makedirs("../frontend", exist_ok=True)
    
    # Lancer l'application Flask
    app.run(
        debug=config.MODE_DEBUG,
        host=config.HOTE,
        port=config.PORT,
        use_reloader=False
    )