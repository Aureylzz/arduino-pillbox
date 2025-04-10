"""
Service classes implementing business logic.
Each service encapsulates operations for a specific domain.
"""

import serial
import json
from models import User, Medication, Prescription, Message
from repositories import UserRepository, MedicationRepository, PrescriptionRepository, MessageRepository


class AuthService:
    """Service for authentication and authorization."""
    
    @staticmethod
    def login(username, password):
        """Authenticate a user with username and password."""
        user = UserRepository.get_by_username(username)
        if user and user.password == password:  # In production, use proper password hashing
            return user
        return None
    
    @staticmethod
    def is_doctor(user_id):
        """Check if a user is a doctor."""
        user = UserRepository.get_by_id(user_id)
        if user:
            return user.is_doctor
        return False


class UserService:
    """Service for user operations."""
    
    @staticmethod
    def get_all_patients():
        """Get all patients."""
        return UserRepository.get_all_patients()
    
    @staticmethod
    def get_all_doctors():
        """Get all doctors."""
        return UserRepository.get_all_doctors()
    
    @staticmethod
    def get_user(user_id):
        """Get a user by ID."""
        return UserRepository.get_by_id(user_id)


class MedicationService:
    """Service for medication operations."""
    
    @staticmethod
    def get_all_medications():
        """Get all medications."""
        return MedicationRepository.get_all()
    
    @staticmethod
    def get_medication(medication_id):
        """Get a medication by ID."""
        return MedicationRepository.get_by_id(medication_id)
    
    @staticmethod
    def create_medication(name, dosage, doctor_id):
        """Create a new medication."""
        medication = Medication(name=name, dosage=dosage, created_by=doctor_id)
        return MedicationRepository.create(medication)


class PrescriptionService:
    """Service for prescription operations."""
    
    @staticmethod
    def get_prescriptions_for_patient(patient_id):
        """Get all active prescriptions for a patient."""
        return PrescriptionRepository.get_by_patient(patient_id)
    
    @staticmethod
    def get_prescriptions_by_doctor(doctor_id):
        """Get all prescriptions created by a doctor."""
        return PrescriptionRepository.get_by_doctor(doctor_id)
    
    @staticmethod
    def create_prescription(doctor_id, patient_id, medication_id, motor_number, intake_time):
        """Create a new prescription."""
        prescription = Prescription(
            doctor_id=doctor_id,
            patient_id=patient_id,
            medication_id=medication_id,
            motor_number=motor_number,
            intake_time=intake_time,
            active=True
        )
        return PrescriptionRepository.create(prescription)
    
    @staticmethod
    def deactivate_prescription(prescription_id):
        """Deactivate a prescription."""
        return PrescriptionRepository.deactivate(prescription_id)


class MessageService:
    """Service for message operations."""
    
    @staticmethod
    def get_conversation(user1_id, user2_id):
        """Get all messages between two users."""
        return MessageRepository.get_conversation(user1_id, user2_id)
    
    @staticmethod
    def get_messages_for_user(user_id):
        """Get all messages for a user."""
        return MessageRepository.get_user_messages(user_id)
    
    @staticmethod
    def send_message(sender_id, receiver_id, content):
        """Send a message from one user to another."""
        message = Message(sender_id=sender_id, receiver_id=receiver_id, content=content, read=False)
        return MessageRepository.create(message)
    
    @staticmethod
    def mark_conversation_as_read(sender_id, receiver_id):
        """Mark all messages in a conversation as read for the receiver."""
        return MessageRepository.mark_conversation_as_read(sender_id, receiver_id)


class ArduinoService:
    """Service for Arduino communication."""
    
    def __init__(self, port='/dev/ttyACM0', baud_rate=9600):
        """Initialize the Arduino service."""
        self.port = port
        self.baud_rate = baud_rate
        self.serial_conn = None
    
    def connect(self):
        """Connect to the Arduino."""
        try:
            self.serial_conn = serial.Serial(self.port, self.baud_rate, timeout=1)
            return True
        except Exception as e:
            print(f"Error connecting to Arduino: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from the Arduino."""
        if self.serial_conn:
            self.serial_conn.close()
            self.serial_conn = None
    
    def send_command(self, motor_number, action):
        """Send a command to the Arduino to control a motor."""
        if not self.serial_conn:
            if not self.connect():
                return False
        
        command = json.dumps({
            'motor': motor_number,
            'action': action  # 'open' or 'close'
        })
        
        try:
            self.serial_conn.write(command.encode())
            response = self.serial_conn.readline().decode().strip()
            return response == 'OK'
        except Exception as e:
            print(f"Error sending command to Arduino: {e}")
            return False