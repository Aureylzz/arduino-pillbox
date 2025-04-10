"""
Repository classes for data access.
Each repository encapsulates database operations for a specific entity.
"""

from database import get_db_connection
from models import User, Medication, Prescription, Message


class UserRepository:
    """Repository for User data access."""
    
    @staticmethod
    def get_all():
        """Get all users."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM users').fetchall()
        conn.close()
        return [User.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_all_patients():
        """Get all patients (users where is_doctor=0)."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM users WHERE is_doctor = 0').fetchall()
        conn.close()
        return [User.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_all_doctors():
        """Get all doctors (users where is_doctor=1)."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM users WHERE is_doctor = 1').fetchall()
        conn.close()
        return [User.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_by_id(user_id):
        """Get a user by ID."""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        return User.from_db_row(row)
    
    @staticmethod
    def get_by_username(username):
        """Get a user by username."""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        return User.from_db_row(row)
    
    @staticmethod
    def create(user):
        """Create a new user."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (first_name, last_name, username, password, is_doctor) VALUES (?, ?, ?, ?, ?)',
            (user.first_name, user.last_name, user.username, user.password, user.is_doctor)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id
    
    @staticmethod
    def update(user):
        """Update an existing user."""
        conn = get_db_connection()
        conn.execute(
            'UPDATE users SET first_name = ?, last_name = ?, username = ?, password = ?, is_doctor = ? WHERE id = ?',
            (user.first_name, user.last_name, user.username, user.password, user.is_doctor, user.id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(user_id):
        """Delete a user by ID."""
        conn = get_db_connection()
        conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()


class MedicationRepository:
    """Repository for Medication data access."""
    
    @staticmethod
    def get_all():
        """Get all medications."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM medications').fetchall()
        conn.close()
        return [Medication.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_by_id(medication_id):
        """Get a medication by ID."""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM medications WHERE id = ?', (medication_id,)).fetchone()
        conn.close()
        return Medication.from_db_row(row)
    
    @staticmethod
    def get_by_doctor(doctor_id):
        """Get all medications created by a specific doctor."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM medications WHERE created_by = ?', (doctor_id,)).fetchall()
        conn.close()
        return [Medication.from_db_row(row) for row in rows]
    
    @staticmethod
    def create(medication):
        """Create a new medication."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO medications (name, dosage, created_by) VALUES (?, ?, ?)',
            (medication.name, medication.dosage, medication.created_by)
        )
        medication_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return medication_id
    
    @staticmethod
    def update(medication):
        """Update an existing medication."""
        conn = get_db_connection()
        conn.execute(
            'UPDATE medications SET name = ?, dosage = ?, created_by = ? WHERE id = ?',
            (medication.name, medication.dosage, medication.created_by, medication.id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(medication_id):
        """Delete a medication by ID."""
        conn = get_db_connection()
        conn.execute('DELETE FROM medications WHERE id = ?', (medication_id,))
        conn.commit()
        conn.close()


class PrescriptionRepository:
    """Repository for Prescription data access."""
    
    @staticmethod
    def get_all():
        """Get all prescriptions."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM prescriptions').fetchall()
        conn.close()
        return [Prescription.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_by_id(prescription_id):
        """Get a prescription by ID."""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM prescriptions WHERE id = ?', (prescription_id,)).fetchone()
        conn.close()
        return Prescription.from_db_row(row)
    
    @staticmethod
    def get_by_patient(patient_id):
        """Get all prescriptions for a specific patient."""
        conn = get_db_connection()
        rows = conn.execute('''
            SELECT p.*, m.name as medication_name, m.dosage as medication_dosage
            FROM prescriptions p
            JOIN medications m ON p.medication_id = m.id
            WHERE p.patient_id = ? AND p.active = 1
            ORDER BY p.intake_time
        ''', (patient_id,)).fetchall()
        conn.close()
        
        prescriptions = []
        for row in rows:
            prescription = Prescription.from_db_row(row)
            # Add additional information
            prescription.medication_name = row['medication_name']
            prescription.medication_dosage = row['medication_dosage']
            prescriptions.append(prescription)
        
        return prescriptions
    
    @staticmethod
    def get_by_doctor(doctor_id):
        """Get all prescriptions created by a specific doctor."""
        conn = get_db_connection()
        rows = conn.execute('''
            SELECT p.*, 
                   u.first_name as patient_first_name, u.last_name as patient_last_name,
                   m.name as medication_name, m.dosage as medication_dosage
            FROM prescriptions p
            JOIN users u ON p.patient_id = u.id
            JOIN medications m ON p.medication_id = m.id
            WHERE p.doctor_id = ?
            ORDER BY p.created_at DESC
        ''', (doctor_id,)).fetchall()
        conn.close()
        
        prescriptions = []
        for row in rows:
            prescription = Prescription.from_db_row(row)
            # Add additional information
            prescription.patient_name = f"{row['patient_first_name']} {row['patient_last_name']}"
            prescription.medication_name = row['medication_name']
            prescription.medication_dosage = row['medication_dosage']
            prescriptions.append(prescription)
        
        return prescriptions
    
    @staticmethod
    def create(prescription):
        """Create a new prescription."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO prescriptions 
               (doctor_id, patient_id, medication_id, motor_number, intake_time, active) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (prescription.doctor_id, prescription.patient_id, prescription.medication_id,
             prescription.motor_number, prescription.intake_time, prescription.active)
        )
        prescription_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return prescription_id
    
    @staticmethod
    def update(prescription):
        """Update an existing prescription."""
        conn = get_db_connection()
        conn.execute(
            '''UPDATE prescriptions 
               SET doctor_id = ?, patient_id = ?, medication_id = ?, 
                   motor_number = ?, intake_time = ?, active = ?
               WHERE id = ?''',
            (prescription.doctor_id, prescription.patient_id, prescription.medication_id,
             prescription.motor_number, prescription.intake_time, prescription.active,
             prescription.id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def deactivate(prescription_id):
        """Deactivate a prescription (set active=0)."""
        conn = get_db_connection()
        conn.execute('UPDATE prescriptions SET active = 0 WHERE id = ?', (prescription_id,))
        conn.commit()
        conn.close()


class MessageRepository:
    """Repository for Message data access."""
    
    @staticmethod
    def get_all():
        """Get all messages."""
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM messages ORDER BY created_at DESC').fetchall()
        conn.close()
        return [Message.from_db_row(row) for row in rows]
    
    @staticmethod
    def get_by_id(message_id):
        """Get a message by ID."""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM messages WHERE id = ?', (message_id,)).fetchone()
        conn.close()
        return Message.from_db_row(row)
    
    @staticmethod
    def get_conversation(user1_id, user2_id):
        """Get all messages between two users."""
        conn = get_db_connection()
        rows = conn.execute('''
            SELECT m.*, 
                   sender.first_name as sender_first_name, sender.last_name as sender_last_name,
                   receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at
        ''', (user1_id, user2_id, user2_id, user1_id)).fetchall()
        conn.close()
        
        messages = []
        for row in rows:
            message = Message.from_db_row(row)
            # Add additional information
            message.sender_name = f"{row['sender_first_name']} {row['sender_last_name']}"
            message.receiver_name = f"{row['receiver_first_name']} {row['receiver_last_name']}"
            messages.append(message)
        
        return messages
    
    @staticmethod
    def get_user_messages(user_id):
        """Get all messages sent to or by a user."""
        conn = get_db_connection()
        rows = conn.execute('''
            SELECT m.*, 
                   sender.first_name as sender_first_name, sender.last_name as sender_last_name,
                   receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            ORDER BY m.created_at DESC
        ''', (user_id, user_id)).fetchall()
        conn.close()
        
        messages = []
        for row in rows:
            message = Message.from_db_row(row)
            # Add additional information
            message.sender_name = f"{row['sender_first_name']} {row['sender_last_name']}"
            message.receiver_name = f"{row['receiver_first_name']} {row['receiver_last_name']}"
            messages.append(message)
        
        return messages
    
    @staticmethod
    def create(message):
        """Create a new message."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO messages (sender_id, receiver_id, content, read) VALUES (?, ?, ?, ?)',
            (message.sender_id, message.receiver_id, message.content, message.read)
        )
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return message_id
    
    @staticmethod
    def mark_as_read(message_id):
        """Mark a message as read."""
        conn = get_db_connection()
        conn.execute('UPDATE messages SET read = 1 WHERE id = ?', (message_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def mark_conversation_as_read(sender_id, receiver_id):
        """Mark all messages in a conversation as read for the receiver."""
        conn = get_db_connection()
        conn.execute(
            'UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?',
            (sender_id, receiver_id)
        )
        conn.commit()
        conn.close()