import sqlite3
import os
from database import init_db

def populate_database():
    """Populate the database with sample data."""
    # Initialize the database if it doesn't exist
    if not os.path.exists('pillbox.db'):
        init_db()
    
    # Connect to the database
    conn = sqlite3.connect('pillbox.db')
    cursor = conn.cursor()
    
    # Insert sample users (doctors and patients)
    users = [
        # Patients
        ('Jean', 'Dupont', 'jean.dupont', 'password123', 0),
        ('Marie', 'Martin', 'marie.martin', 'password123', 0),
        ('Pierre', 'Bernard', 'pierre.bernard', 'password123', 0),
        # Doctors
        ('Sophie', 'Dubois', 'sophie.dubois', 'password123', 1),
        ('Thomas', 'Leroy', 'thomas.leroy', 'password123', 1)
    ]
    
    cursor.executemany('''
        INSERT INTO users (first_name, last_name, username, password, is_doctor)
        VALUES (?, ?, ?, ?, ?)
    ''', users)
    
    # Get user IDs
    cursor.execute('SELECT id FROM users WHERE is_doctor = 0')
    patient_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute('SELECT id FROM users WHERE is_doctor = 1')
    doctor_ids = [row[0] for row in cursor.fetchall()]
    
    # Insert sample medications
    medications = [
        ('Paracétamol', '500mg', doctor_ids[0]),
        ('Ibuprofène', '400mg', doctor_ids[0]),
        ('Aspirine', '300mg', doctor_ids[1]),
        ('Amoxicilline', '1000mg', doctor_ids[1]),
        ('Levothyroxine', '50mcg', doctor_ids[0])
    ]
    
    cursor.executemany('''
        INSERT INTO medications (name, dosage, created_by)
        VALUES (?, ?, ?)
    ''', medications)
    
    # Get medication IDs
    cursor.execute('SELECT id FROM medications')
    medication_ids = [row[0] for row in cursor.fetchall()]
    
    # Insert sample prescriptions
    prescriptions = [
        (doctor_ids[0], patient_ids[0], medication_ids[0], 1, '08:00', 1),
        (doctor_ids[0], patient_ids[0], medication_ids[1], 2, '12:00', 1),
        (doctor_ids[1], patient_ids[1], medication_ids[2], 1, '09:00', 1),
        (doctor_ids[1], patient_ids[1], medication_ids[3], 3, '18:00', 1),
        (doctor_ids[0], patient_ids[2], medication_ids[4], 2, '07:00', 1)
    ]
    
    cursor.executemany('''
        INSERT INTO prescriptions (doctor_id, patient_id, medication_id, motor_number, intake_time, active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', prescriptions)
    
    # Insert sample messages
    messages = [
        (patient_ids[0], doctor_ids[0], "Bonjour Docteur, j'ai commencé à prendre le médicament mais j'ai des maux de tête.", 0),
        (doctor_ids[0], patient_ids[0], "Bonjour, c'est un effet secondaire possible. Continuez le traitement mais tenez-moi informé.", 1),
        (patient_ids[1], doctor_ids[1], "Bonjour, puis-je prendre le médicament avec du jus d'orange?", 0),
        (doctor_ids[1], patient_ids[1], "Bonjour, oui vous pouvez le prendre avec du jus d'orange sans problème.", 1)
    ]
    
    cursor.executemany('''
        INSERT INTO messages (sender_id, receiver_id, content, read)
        VALUES (?, ?, ?, ?)
    ''', messages)
    
    # Commit the changes and close the connection
    conn.commit()
    conn.close()
    
    print("Database successfully populated with sample data.")

if __name__ == '__main__':
    populate_database()