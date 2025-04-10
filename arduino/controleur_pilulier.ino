/**
 * Fichier : controleur_pilulier.ino
 * --------------------------------------------------------------------------------------------------------------------
 * Ce programme contrôle un moteur pas à pas relié à un pilulier.
 * Il utilise la bibliothèque ArduinoJson pour interpréter les commandes reçues via le port série (ouverture/fermeture)
 *
 * Le moteur est un 28BYJ-48 (par exemple) piloté par un ULN2003, configuré sur les pins 2,3,4,5.
 *
 * Quand on envoie une commande JSON comme : {"motor":1, "action":"open"}
 * le programme ouvre le pilulier.
 * 
 * Quand on envoie : {"motor":1, "action":"close"}
 * le programme ferme le pilulier.
 * --------------------------------------------------------------------------------------------------------------------
 */

 #include <Arduino.h>
 #include <ArduinoJson.h> // Pour l'analyse (ce qu'on appelle le parsing) des commandes JSON
 #include <Stepper.h>     // Pour contrôler le moteur pas à pas
 
 // Nombre de pas par révolution spécifique à notre moteur (28BYJ-48)
 const int PAS_PAR_REVOLUTION = 2048;
 
 // Vitesse du moteur (exprimée en tours par minute, ou RPM)
 const int VITESSE_MOTEUR = 8;
 
 // L'angle à parcourir pour ouvrir ou fermer en degrés (ici on va dire que 90° suffit à ouvrir ou fermer le couvercle)
 const int ANGLE_OUVERTURE = 90;
 const int ANGLE_FERMETURE = 90;
 
 // Calcul du nombre de pas pour ouvrir ou fermer, en fonction de l'angle
 // La formule : (nombre_de_pas_par_revolution * angle) / 360
 const int PAS_POUR_OUVRIR = PAS_PAR_REVOLUTION * ANGLE_OUVERTURE / 360;
 const int PAS_POUR_FERMER = PAS_PAR_REVOLUTION * ANGLE_FERMETURE / 360;
 
 // Création de l'objet Stepper :
 //   - Les 4 pins (dans l'ordre) : 2,4,3,5
 //   - 'PAS_PAR_REVOLUTION' indique le nombre de pas par révolution complet
 Stepper moteur(PAS_PAR_REVOLUTION, 2, 4, 3, 5);
 
 // Variable booléenne qui indique l'état du pilulier :
 //   - false => fermé
 //   - true  => ouvert
 bool etatMoteur = false;
 
 // Indique si la phase d'initialisation est terminée
 bool initialisationTerminee = false;
 
 // Prototypes de fonctions
 void analyserEtExecuterCommande(String commande);
 void controlerMoteur(String action);
 void eteindreMoteur();
 
 void setup() {
   // Démarrage de la liaison série (pour communication PC/Arduino)
   Serial.begin(9600);
 
   // On définit la vitesse de rotation du moteur (en RPM)
   moteur.setSpeed(VITESSE_MOTEUR);
 
   // Initialisation des pins 2 à 5 en sortie et mise à l'état LOW
   for (int pin = 2; pin <= 5; pin++) {
     pinMode(pin, OUTPUT);
     digitalWrite(pin, LOW);
   }
 
   // Attendre que la liaison série soit prête (utile sur certains types d'Arduino)
   while (!Serial) {
     ;
   }
 
   // Message de bienvenue
   Serial.println("Contrôleur Pilulier Prêt");
 
   // L'initialisation est terminée
   initialisationTerminee = true;
 }
 
 void loop() {
   // On vérifie si des données sont arrivées sur le port série
   if (Serial.available() > 0) {
     // Lire la commande jusqu'au caractère '\n'
     String commande = Serial.readStringUntil('\n');
     
     // Supprimer les espaces inutiles au début/fin
     commande.trim();
 
     // Si la chaîne n'est pas vide, on l'analyse
     if (commande.length() > 0) {
       analyserEtExecuterCommande(commande);
     }
   }
 }
 
 /**
  * Analyser la commande JSON reçue et exécuter l'action appropriée.
  * Exemple de commande : {"motor":1, "action":"open"}
  */
 void analyserEtExecuterCommande(String commande) {
   // On réserve un document JSON de taille 200 octets
   StaticJsonDocument<200> doc;
 
   // Désérialiser la chaîne 'commande' dans l'objet doc
   DeserializationError erreur = deserializeJson(doc, commande);
   if (erreur) {
     Serial.println("ERROR: JSON parsing failed");
     return;
   }
 
   // Récupérer le champ "motor" (pas utilisé en détail dans ce code,
   // car on n'a qu'un seul moteur) et "action" (ou "open"/"close")
   int numeroMoteur = doc["motor"]; 
   String action = doc["action"];
 
   // Vérifier si l'action est valide
   if (action != "open" && action != "close") {
     Serial.println("ERROR: Invalid action");
     return;
   }
 
   // Appeler la fonction pour contrôler le moteur
   controlerMoteur(action);
 
   // Si tout s'est bien passé
   Serial.println("OK");
 }
 
 /**
  * Contrôler le moteur en fonction de l'action ("open" ou "close").
  * - Si "open" et que le pilulier est fermé, on ouvre
  * - Si "close" et que le pilulier est ouvert, on ferme
  * - Sinon, on dit que l'état est déjà atteint.
  */
 void controlerMoteur(String action) {
   int pas = 0; // nombre de pas à parcourir
 
   // OUVERTURE
   if (action == "open" && !etatMoteur) {
     Serial.println("Ouverture du pilulier");
     pas = PAS_POUR_OUVRIR;
     etatMoteur = true; // Le pilulier est désormais ouvert
   }
   // FERMETURE
   else if (action == "close" && etatMoteur) {
     Serial.println("Fermeture du pilulier");
     pas = -PAS_POUR_FERMER; // sens inverse pour fermer
     etatMoteur = false; // Le pilulier est désormais fermé
   }
   else {
     // Si on arrive ici, ça veut dire qu'on demande d'ouvrir un pilulier déjà ouvert,
     // ou de fermer un pilulier déjà fermé.
     Serial.println("Le pilulier est déjà dans l'état souhaité");
     return;
   }
 
   // Effectuer le déplacement du moteur
   moteur.step(pas);
 
   // Couper l'alimentation du moteur pour éviter de le laisser en tension permanente
   eteindreMoteur();
 }
 
 /**
  * Mettre tous les pins du moteur à LOW pour ne plus alimenter le moteur.
  * Cela évite la surconsommation et la surchauffe.
  */
 void eteindreMoteur() {
   for (int pin = 2; pin <= 5; pin++) {
     digitalWrite(pin, LOW);
   }
 }