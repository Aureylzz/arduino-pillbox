"""
Data models for the Pillbox application.
Each model represents a database entity and provides methods for data conversion.
"""

class User:
    """User model representing either a patient or a doctor."""
    def __init__(self, id=None, first_name=None, last_name=None, username=None, password=None, is_doctor=False):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.username = username
        self.password = password  # Note: In production, passwords should be hashed
        self.is_doctor = is_doctor
    
    @classmethod
    def from_db_row(cls, row):
        """Create a User instance from a database row."""
        if row is None:
            return None
        return cls(
            id=row['id'],
            first_name=row['first_name'],
            last_name=row['last_name'],
            username=row['username'],
            password=row['password'],
            is_doctor=bool(row['is_doctor'])
        )
    
    def to_dict(self):
        """Convert User to dictionary (for JSON serialization)."""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'username': self.username,
            'is_doctor': self.is_doctor
        }


class Medication:
    """Medication model representing a medication that can be prescribed."""
    def __init__(self, id=None, name=None, dosage=None, created_by=None):
        self.id = id
        self.name = name
        self.dosage = dosage
        self.created_by = created_by
    
    @classmethod
    def from_db_row(cls, row):
        """Create a Medication instance from a database row."""
        if row is None:
            return None
        return cls(
            id=row['id'],
            name=row['name'],
            dosage=row['dosage'],
            created_by=row['created_by']
        )
    
    def to_dict(self):
        """Convert Medication to dictionary (for JSON serialization)."""
        return {
            'id': self.id,
            'name': self.name,
            'dosage': self.dosage,
            'created_by': self.created_by
        }


class Prescription:
    """Prescription model representing a medication prescribed to a patient."""
    def __init__(self, id=None, doctor_id=None, patient_id=None, medication_id=None, 
                 motor_number=None, intake_time=None, active=True, created_at=None):
        self.id = id
        self.doctor_id = doctor_id
        self.patient_id = patient_id
        self.medication_id = medication_id
        self.motor_number = motor_number
        self.intake_time = intake_time
        self.active = active
        self.created_at = created_at
    
    @classmethod
    def from_db_row(cls, row):
        """Create a Prescription instance from a database row."""
        if row is None:
            return None
        return cls(
            id=row['id'],
            doctor_id=row['doctor_id'],
            patient_id=row['patient_id'],
            medication_id=row['medication_id'],
            motor_number=row['motor_number'],
            intake_time=row['intake_time'],
            active=bool(row['active']),
            created_at=row['created_at']
        )
    
    def to_dict(self):
        """Convert Prescription to dictionary (for JSON serialization)."""
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'patient_id': self.patient_id,
            'medication_id': self.medication_id,
            'motor_number': self.motor_number,
            'intake_time': self.intake_time,
            'active': self.active,
            'created_at': self.created_at
        }


class Message:
    """Message model representing a communication between users."""
    def __init__(self, id=None, sender_id=None, receiver_id=None, content=None, read=False, created_at=None):
        self.id = id
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.content = content
        self.read = read
        self.created_at = created_at
    
    @classmethod
    def from_db_row(cls, row):
        """Create a Message instance from a database row."""
        if row is None:
            return None
        return cls(
            id=row['id'],
            sender_id=row['sender_id'],
            receiver_id=row['receiver_id'],
            content=row['content'],
            read=bool(row['read']),
            created_at=row['created_at']
        )
    
    def to_dict(self):
        """Convert Message to dictionary (for JSON serialization)."""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'read': self.read,
            'created_at': self.created_at
        }