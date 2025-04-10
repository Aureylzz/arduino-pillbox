/**
 * Pillbox Controller
 * 
 * Controls 3 stepper motors (28BYJ-48) with ULN2003 driver boards.
 * Receives commands via Serial port in JSON format.
 * 
 * Command format: {"motor": 1-3, "action": "open"/"close"}
 * Response: "OK" on success, "ERROR" on failure
 * 
 * Connections:
 * - ULN2003 Driver 1: pins 2, 3, 4, 5
 * - ULN2003 Driver 2: pins 6, 7, 8, 9
 * - ULN2003 Driver 3: pins 10, 11, 12, 13
 */

 #include <ArduinoJson.h>
 #include <Stepper.h>
 
 // Constants
 const int STEPS_PER_REVOLUTION = 2048;  // Steps per revolution for 28BYJ-48
 const int MOTOR_SPEED = 8;              // Speed in RPM (low for better torque)
 const int OPEN_ANGLE = 90;              // Degrees to open the box
 const int CLOSE_ANGLE = 90;             // Degrees to close the box
 const int STEPS_FOR_OPEN = STEPS_PER_REVOLUTION * OPEN_ANGLE / 360;
 const int STEPS_FOR_CLOSE = STEPS_PER_REVOLUTION * CLOSE_ANGLE / 360;
 
 // Stepper motor setup
 Stepper motor1(STEPS_PER_REVOLUTION, 2, 4, 3, 5);   // Motor 1 pins: IN1, IN3, IN2, IN4
 Stepper motor2(STEPS_PER_REVOLUTION, 6, 8, 7, 9);   // Motor 2 pins: IN1, IN3, IN2, IN4
 Stepper motor3(STEPS_PER_REVOLUTION, 10, 12, 11, 13); // Motor 3 pins: IN1, IN3, IN2, IN4
 
 // Motor states (true = open, false = closed)
 bool motorStates[3] = {false, false, false};
 
 // Function prototypes
 void parseAndExecuteCommand(String command);
 void controlMotor(int motorNumber, String action);
 void turnOffMotor(int motorNumber);
 
 void setup() {
   // Initialize serial communication
   Serial.begin(9600);
   
   // Set motor speeds
   motor1.setSpeed(MOTOR_SPEED);
   motor2.setSpeed(MOTOR_SPEED);
   motor3.setSpeed(MOTOR_SPEED);
   
   // Initialize all pins as outputs and set them LOW to prevent motor overheating
   for (int pin = 2; pin <= 13; pin++) {
     pinMode(pin, OUTPUT);
     digitalWrite(pin, LOW);
   }
   
   // Wait for serial connection
   while (!Serial) continue;
   
   // Send ready message
   Serial.println("Pillbox Controller Ready");
 }
 
 void loop() {
   // Check if serial data is available
   if (Serial.available()) {
     // Read incoming command
     String command = Serial.readStringUntil('\n');
     
     // Process command
     parseAndExecuteCommand(command);
   }
 }
 
 /**
  * Parse JSON command and execute the corresponding motor action
  */
 void parseAndExecuteCommand(String command) {
   // Allocate the JSON document
   StaticJsonDocument<200> doc;
   
   // Parse JSON
   DeserializationError error = deserializeJson(doc, command);
   
   // Check for parsing errors
   if (error) {
     Serial.println("ERROR: JSON parsing failed");
     return;
   }
   
   // Extract values
   int motorNumber = doc["motor"];
   String action = doc["action"];
   
   // Validate motor number
   if (motorNumber < 1 || motorNumber > 3) {
     Serial.println("ERROR: Invalid motor number");
     return;
   }
   
   // Validate action
   if (action != "open" && action != "close") {
     Serial.println("ERROR: Invalid action");
     return;
   }
   
   // Execute the command
   controlMotor(motorNumber, action);
   
   // Send success response
   Serial.println("OK");
 }
 
 /**
  * Control a specific motor to open or close
  */
 void controlMotor(int motorNumber, String action) {
   int motorIndex = motorNumber - 1;  // Convert to 0-based index
   int steps = 0;
   
   // Determine direction and steps based on current state and requested action
   if (action == "open" && !motorStates[motorIndex]) {
     steps = STEPS_FOR_OPEN;
     motorStates[motorIndex] = true;
   } else if (action == "close" && motorStates[motorIndex]) {
     steps = -STEPS_FOR_CLOSE;
     motorStates[motorIndex] = false;
   } else {
     // Box is already in the requested state
     return;
   }
   
   // Control the appropriate motor
   switch (motorNumber) {
     case 1:
       motor1.step(steps);
       break;
     case 2:
       motor2.step(steps);
       break;
     case 3:
       motor3.step(steps);
       break;
   }
   
   // Turn off motor after operation to prevent overheating
   turnOffMotor(motorNumber);
 }
 
 /**
  * Turn off all pins for a specific motor to prevent overheating
  */
 void turnOffMotor(int motorNumber) {
   int startPin = 2 + (motorNumber - 1) * 4;  // Calculate starting pin for this motor
   
   // Set all 4 pins for this motor LOW
   for (int pin = startPin; pin < startPin + 4; pin++) {
     digitalWrite(pin, LOW);
   }
 }