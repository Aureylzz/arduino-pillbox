# Pilulier Arduino

Bienvenue dans ce projet scolaire de **Pilulier** !

> **Si toi aussi tu as un professeur qui a raté sa vie et qui aime se défouler et passer sa frustration en te donnant des projets impossibles à réaliser pour ton niveau, tu es au bon endroit.**

Ce projet se compose d’un backend (serveur Flask en Python), d’un frontend (HTML/CSS/JS) et d’un code Arduino qui pilote un moteur pas à pas pour ouvrir/fermer un pilulier.

L’objectif est de proposer un **pilulier connecté** permettant, entre autres, aux médecins de prescrire des médicaments et aux patients de consulter/contrôler leur pilulier et d’échanger des messages.

---

## Sommaire

1. [Fonctionnalités Principales](#fonctionnalités-principales)  
2. [Prérequis Matériels et Logiciels](#prérequis-matériels-et-logiciels)  
3. [Installation Sous Windows](#installation-sous-windows)  
   1. [Installation de Python](#installation-de-python)  
   2. [Cloner ou Télécharger le Projet](#cloner-ou-télécharger-le-projet)  
   3. [Ouvrir un Terminal PowerShell](#ouvrir-un-terminal-powershell)  
   4. [Installer les Dépendances Python](#installer-les-dépendances-python)  
4. [Initialiser la Base de Données](#initialiser-la-base-de-données)  
5. [Lancer le Serveur Backend](#lancer-le-serveur-backend)  
6. [Téléverser le Code Arduino](#téléverser-le-code-arduino)  
7. [Accéder à l’Application Web](#accéder-à-lapplication-web)  
8. [FAQ / Problèmes Courants](#faq--problèmes-courants)  

---

## Fonctionnalités Principales

- **Gestion des utilisateurs** : Patients ou Médecins (création, connexion).  
- **Prescriptions** : Un médecin peut créer, lister et désactiver des prescriptions.  
- **Médicaments** : Un médecin peut ajouter de nouveaux médicaments à la base.  
- **Messagerie** : Patients et médecins peuvent s’envoyer des messages.  
- **Contrôle du pilulier** : Le patient peut ouvrir/fermer le pilulier (un seul moteur pas à pas).  
- **Vue Arduino** : Le code `controleur_pilulier.ino` lit les commandes via le port série et pilote le moteur.

---

## Prérequis Matériels et Logiciels

1. **Un ordinateur sous Windows** (Windows 10 ou 11).  
2. **Python 3.9 ou ultérieur** (avec `pip`).  
3. **Arduino IDE** (pour compiler et envoyer le code sur la carte Arduino).  
4. **Carte Arduino** (UNO ou similaire) + un moteur pas à pas 28BYJ-48 + driver ULN2003 (câblage standard).  
5. **Git** (optionnel) si vous souhaitez cloner le dépôt depuis GitHub (sinon, vous pouvez télécharger un zip).

---

## Installation Sous Windows

### 1. Installation de Python

1. Rendez-vous sur [le site officiel de Python](https://www.python.org/downloads/windows/).  
2. Téléchargez la dernière version stable (par ex. Python 3.10+).  
3. **Cochez** l’option “Add Python to PATH” lors de l’installation, pour que Python soit accessible dans PowerShell.  

Pour vérifier ensuite, ouvrez PowerShell et tapez :

```powershell
python --version
```

Vous devriez voir un numéro de version Python (par ex. `Python 3.10.4`).

### 2. Cloner ou Télécharger le Projet

- **Si vous utilisez Git** :  
  ```powershell
  git clone https://github.com/votre-compte/pilulier-intelligent.git
  cd pilulier-intelligent
  ```
- **Sinon** :  
  - Téléchargez l’archive .zip depuis la plateforme (ou la ressource qui vous est fournie).  
  - Décompressez l’archive dans un dossier, par exemple `C:\Users\VotreNom\pilulier-intelligent`.  
  - Ouvrez ce dossier dans l’Explorateur ou dans PowerShell.

### 3. Ouvrir un Terminal PowerShell

1. Dans l’Explorateur Windows, rendez-vous dans le dossier du projet (ex. `pilulier-intelligent`).  
2. **Clique droit** → “Ouvrir dans Windows Terminal” ou “Ouvrir dans PowerShell”.  
3. Vous devriez voir le prompt PowerShell situé dans votre dossier (ex. `PS C:\Users\VotreNom\pilulier-intelligent>`).

### 4. Installer les Dépendances Python

Dans ce projet, le fichier `requirements.txt` contient la liste des librairies nécessaires (Flask, etc.). Tapez :

```powershell
pip install -r requirements.txt
```

ou bien

```powershell
python -m pip install -r requirements.txt
```

pour installer Flask, ArduinoJson (pas nécessaire côté Python, c’est côté Arduino), etc.  
*(Vérifiez bien que cette commande ne renvoie pas d’erreurs.)*

---

## Initialiser la Base de Données

1. Rendez-vous dans le dossier `backend/bdd` (ou restez à la racine, selon l’organisation).  
2. **Exécutez** la commande suivante pour créer la base de données (pilulier.db) et exécuter le script `schema.sql` :

```powershell
python -m backend.bdd.initialiser_bdd
```

Vous devriez voir le message :  
```
Base de données initialisée avec succès.
```
*(Si vous voyez “La base de données existe déjà. Initialisation ignorée.”, c’est qu’elle était déjà créée.)*

3. Ensuite, pour insérer des **données d’exemple** (utilisateurs, médicaments, etc.), tapez :

```powershell
python -m backend.bdd.peupler_bdd
```

Vous devriez voir :  
```
Base de données peuplée avec succès.
```

*(La base `pilulier.db` se trouve dans `backend/bdd`, selon la configuration.)*

---

## Lancer le Serveur Backend

Un **serveur backend** est une application qui tourne localement et qui va répondre aux requêtes de votre navigateur (front-end). Dans notre projet, c’est une app **Flask** en Python.  

- Toujours dans PowerShell, à la racine du projet, tapez :  
  ```powershell
  python -m backend.app
  ```
- Vous devriez voir un message du genre :  
  ```
  * Serving Flask app 'app'
  * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
  ```
- Votre **serveur** est alors actif et en écoute sur le port `5000`.  

*(Ne fermez pas la fenêtre PowerShell, ou le serveur s’arrêtera.)*

---

## Téléverser le Code Arduino

1. **Ouvrez Arduino IDE** (téléchargé depuis [arduino.cc](https://www.arduino.cc/en/software)).  
2. Dans le menu **Fichier** → **Ouvrir**, sélectionnez le fichier `controleur_pilulier.ino` qui se trouve dans `arduino/`.  
3. Dans Arduino IDE :
   - Sélectionnez votre **carte** (ex. “Arduino UNO”) dans **Outils > Type de Carte**.  
   - Sélectionnez votre **port** (ex. `COM3`) dans **Outils > Port**.  
4. Appuyez sur la **flèche de téléversement** (bouton “Upload”).  
5. Patientez : vous devriez voir *“Téléversement terminé.”* dans la console IDE.  

Le code Arduino va alors être exécuté sur votre carte. Il écoute les commandes via le port série (à 9600 bauds) et pilote le moteur.

---

## Accéder à l’Application Web

Une fois le **serveur Flask** lancé (voir section [Lancer le Serveur Backend](#lancer-le-serveur-backend)), ouvrez votre **navigateur** (Chrome, Edge, Firefox...) et tapez :

```
http://127.0.0.1:5000/
```

ou

```
http://localhost:5000/
```

Vous verrez la page d’accueil (`index.html`) du projet :

- Écran de connexion : saisissez un **nom d’utilisateur** et un **mot de passe** (si vous avez peuplé la base avec les données d’exemple, essayez `jean.dupont / password123` ou `sophie.dubois / password123`).  
- Une fois connecté en tant que **patient** ou **médecin**, vous accédez au **tableau de bord** correspondant.  
- Si vous avez l’Arduino branché sur `COM3` et le service configuré, vous pouvez tester l’ouverture/fermeture du pilulier.

---

## FAQ / Problèmes Courants

1. **Le terminal dit “Adresse déjà utilisée”**  
   - Ça signifie qu’un autre programme occupe le port 5000. Soit stoppez ce programme, soit modifiez le port dans `config.py`.

2. **La base de données n’est pas trouvée**  
   - Assurez-vous d’avoir bien **initialisé** la BDD, et que `CHEMIN_BDD` dans `config.py` pointe vers le bon dossier (par exemple `backend/bdd/pilulier.db`).

3. **Le moteur ne bouge pas**  
   - Vérifiez le **câblage** (28BYJ-48 avec ULN2003).  
   - Assurez-vous que le code Arduino s’exécute, et que la variable `UTILISER_ARDUINO_SIMULE` dans `app.py` n’est pas activée (ou la partie port série est correctement détectée).

4. **Impossible de se connecter avec les identifiants de test**  
   - Vérifiez que la base a été peuplée (`peupler_bdd.py`).  
   - Regardez dans la table `utilisateurs` via un utilitaire SQLite ou en ligne de commande pour voir les identifiants.

5. **J’ai un message d’erreur “No module named…”**  
   - Assurez-vous d’avoir fait `pip install -r requirements.txt`, ou vérifiez votre version de Python.
