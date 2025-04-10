# Smart Pillbox System

A comprehensive system for managing medication prescriptions and automating a physical pillbox using Arduino and stepper motors.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Hardware Requirements](#hardware-requirements)
- [Software Requirements](#software-requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Arduino Integration](#arduino-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The Smart Pillbox System is a comprehensive solution designed to help patients manage their medications and allow doctors to prescribe and monitor them. The system consists of:

1. A web application with different interfaces for patients and doctors
2. A backend server that manages data and business logic
3. An Arduino-controlled pillbox with 3 compartments operated by stepper motors

The system allows doctors to prescribe medications to patients, specifying which compartment (motor) should contain each medication and when it should be taken. Patients can view their prescriptions and control the pillbox to access their medications.

## Architecture

The Smart Pillbox System follows a multi-tier architecture with clear separation of concerns:

1. **Presentation Layer**: HTML/CSS/JS frontend
   - User interface for patients and doctors
   - Responsive design that works on various devices

2. **Application Layer**: Python Flask backend
   - RESTful API for data access
   - Business logic implementation
   - Session management

3. **Data Layer**: SQLite database
   - Persistent storage for users, medications, prescriptions, and messages
   - Structured according to relational database principles

4. **Hardware Layer**: Arduino with stepper motors
   - Controls physical pillbox compartments
   - Communicates with the backend via Serial

This architecture follows SOLID principles and provides clear separation between components, making the system maintainable and extensible.

## Features

### For Patients
- View prescribed medications and schedules
- Open and close pillbox compartments
- Send messages to doctors
- View conversation history with doctors

### For Doctors
- Manage medications (add new medications)
- Prescribe medications to patients
- Specify pillbox compartment and intake time
- Deactivate prescriptions
- Communicate with patients through messages

### General
- Secure login system
- Intuitive user interface
- Real-time communication
- Physical pillbox integration

## Hardware Requirements

- Arduino UNO R4 Minima [ABX00080]
- 3x 28BYJ-48 5V Stepper Motors
- 3x ULN2003 Driver Boards
- Dupont Breadboard Cables (Male to Female, Male to Male, Female to Female)
- Computer with USB port for Arduino connection
- Power supply for Arduino and motors

## Software Requirements

- Python 3.7+
- Flask web framework
- SQLite3
- Arduino IDE
- Modern web browser
- Required Python packages (see requirements.txt)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-pillbox.git
   cd smart-pillbox
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database**
   ```bash
   python database.py
   ```

4. **Populate the database with sample data (optional)**
   ```bash
   python populate_db.py
   ```

5. **Upload Arduino code**
   - Open `pillbox_controller.ino` in the Arduino IDE
   - Connect your Arduino to the computer
   - Upload the sketch to the Arduino

6. **Start the Flask server**
   ```bash
   python app.py
   ```

7. **Access the web application**
   - Open a web browser and navigate to `http://localhost:5000`

## Project Structure

```
smart-pillbox/
├── app.py                  # Main Flask application
├── database.py             # Database initialization
├── populate_db.py          # Sample data population script
├── schema.sql              # Database schema
├── models.py               # Data models
├── repositories.py         # Data access layer
├── services.py             # Business logic
├── pillbox.db              # SQLite database
├── static/                 # Static web files
│   ├── css/                # CSS styles
│   │   └── styles.css      # Main stylesheet
│   ├── js/                 # JavaScript files
│   │   ├── api.js          # API service
│   │   ├── app.js          # Main application script
│   │   ├── auth.js         # Authentication logic
│   │   ├── doctor.js       # Doctor dashboard logic
│   │   └── patient.js      # Patient dashboard logic
│   └── index.html          # Main HTML file
└── arduino/                # Arduino code
    └── pillbox_controller.ino  # Arduino sketch for pillbox control
```

## Database Schema

The system uses a SQLite database with the following tables:

1. **users**: Stores both patients and doctors
   - `id`: Primary key
   - `first_name`: User's first name
   - `last_name`: User's last name
   - `username`: Unique username for login
   - `password`: User's password (plaintext for this project, should be hashed in production)
   - `is_doctor`: Boolean flag indicating if the user is a doctor

2. **medications**: Stores medication information
   - `id`: Primary key
   - `name`: Medication name
   - `dosage`: Medication dosage
   - `created_by`: Foreign key to users table (doctor who created the medication)

3. **prescriptions**: Stores prescriptions assigned to patients
   - `id`: Primary key
   - `doctor_id`: Foreign key to users table (prescribing doctor)
   - `patient_id`: Foreign key to users table (patient)
   - `medication_id`: Foreign key to medications table
   - `motor_number`: Pillbox compartment number (1-3)
   - `intake_time`: Time when the medication should be taken
   - `active`: Boolean flag indicating if the prescription is active
   - `created_at`: Timestamp when the prescription was created

4. **messages**: Stores messages between users
   - `id`: Primary key
   - `sender_id`: Foreign key to users table (message sender)
   - `receiver_id`: Foreign key to users table (message receiver)
   - `content`: Message content
   - `read`: Boolean flag indicating if the message has been read
   - `created_at`: Timestamp when the message was sent

## Configuration

The Flask application can be configured by modifying the following settings in `app.py`:

```python
# Flask app configuration
app.secret_key = 'pillbox_secret_key'  # Change this in production
app.config['SESSION_TYPE'] = 'filesystem'

# Arduino connection configuration
arduino_service = ArduinoService(port='/dev/ttyACM0')  # Adjust port as needed
```

## API Documentation

The system provides the following REST API endpoints:

### Authentication
- `POST /api/login`: Authenticate a user
- `POST /api/logout`: Log out a user

### Users
- `GET /api/users?is_doctor=true|false`: Get users filtered by type

### Medications
- `GET /api/medications`: Get all medications
- `POST /api/medications`: Create a new medication

### Prescriptions
- `GET /api/prescriptions`: Get prescriptions for the current user
- `POST /api/prescriptions`: Create a new prescription
- `POST /api/prescriptions/<id>/deactivate`: Deactivate a prescription

### Messages
- `GET /api/messages`: Get messages for the current user
- `POST /api/messages`: Send a new message
- `GET /api/conversations/<user_id>`: Get a conversation with a specific user

### Pillbox Control
- `POST /api/pillbox/control`: Control a pillbox motor

## Arduino Integration

The Arduino sketch (`pillbox_controller.ino`) controls the stepper motors using the following pin configuration:

- **Motor 1**: Pins 2, 3, 4, 5
- **Motor 2**: Pins 6, 7, 8, 9
- **Motor 3**: Pins 10, 11, 12, 13

The Arduino listens for commands via the Serial port and expects JSON-formatted messages:

```json
{"motor": 1, "action": "open"}
```

Where:
- `motor`: Motor number (1-3)
- `action`: "open" or "close"

The Arduino responds with "OK" on success or "ERROR" on failure.

## Troubleshooting

### Web Application
- **Login issues**: Ensure the correct username and password are being used
- **API errors**: Check the browser console for error details
- **Database errors**: Verify the database file exists and has the correct schema

### Arduino
- **Connection issues**: Verify the correct port is specified in `app.py`
- **Motor not responding**: Check the wiring and motor driver connections
- **Serial communication errors**: Ensure the baud rate matches (9600)

## License

This project is licensed under the MIT License - see the LICENSE file for details.