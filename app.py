"""
Main Flask application for the Pillbox system.
"""

from flask import Flask, request, jsonify, session, send_from_directory
import os
from services import AuthService, UserService, MedicationService, PrescriptionService, MessageService, ArduinoService
from models import Medication, Prescription, Message

# Create Flask app
app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = 'pillbox_secret_key'  # Change in production
app.config['SESSION_TYPE'] = 'filesystem'

# Initialize Arduino service
# Note: You might need to change the port based on your system
arduino_service = ArduinoService(port='/dev/ttyACM0')

# Serve static files
@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory('static', 'index.html')

# Authentication routes
@app.route('/api/login', methods=['POST'])
def login():
    """Log in a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = AuthService.login(username, password)
    if user:
        session['user_id'] = user.id
        session['is_doctor'] = user.is_doctor
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_doctor': user.is_doctor
            }
        })
    
    return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Log out a user."""
    session.clear()
    return jsonify({'success': True})

# User routes
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get users based on query parameters."""
    user_id = session.get('user_id')
    is_doctor = session.get('is_doctor')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    is_doctor_param = request.args.get('is_doctor')
    
    if is_doctor_param == 'true':
        users = UserService.get_all_doctors()
    elif is_doctor_param == 'false':
        users = UserService.get_all_patients()
    else:
        # Only doctors can see all users
        if not is_doctor:
            return jsonify({'success': False, 'message': 'Non autorisé'}), 403
        users = UserService.get_all_patients()  # By default, return patients for doctors
    
    return jsonify({
        'success': True,
        'users': [user.to_dict() for user in users]
    })

# Medication routes
@app.route('/api/medications', methods=['GET'])
def get_medications():
    """Get all medications."""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    medications = MedicationService.get_all_medications()
    
    return jsonify({
        'success': True,
        'medications': [medication.to_dict() for medication in medications]
    })

@app.route('/api/medications', methods=['POST'])
def create_medication():
    """Create a new medication (doctors only)."""
    user_id = session.get('user_id')
    is_doctor = session.get('is_doctor')
    
    if not user_id or not is_doctor:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    data = request.json
    name = data.get('name')
    dosage = data.get('dosage')
    
    medication_id = MedicationService.create_medication(name, dosage, user_id)
    
    return jsonify({'success': True, 'medication_id': medication_id})

# Prescription routes
@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    """Get prescriptions based on user role."""
    user_id = session.get('user_id')
    is_doctor = session.get('is_doctor')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    if is_doctor:
        prescriptions = PrescriptionService.get_prescriptions_by_doctor(user_id)
    else:
        prescriptions = PrescriptionService.get_prescriptions_for_patient(user_id)
    
    # Convert prescriptions to dictionaries with additional fields
    prescription_dicts = []
    for p in prescriptions:
        p_dict = p.to_dict()
        if hasattr(p, 'medication_name'):
            p_dict['medication_name'] = p.medication_name
        if hasattr(p, 'medication_dosage'):
            p_dict['medication_dosage'] = p.medication_dosage
        if hasattr(p, 'patient_name'):
            p_dict['patient_name'] = p.patient_name
        prescription_dicts.append(p_dict)
    
    return jsonify({
        'success': True,
        'prescriptions': prescription_dicts
    })

@app.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    """Create a new prescription (doctors only)."""
    user_id = session.get('user_id')
    is_doctor = session.get('is_doctor')
    
    if not user_id or not is_doctor:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    data = request.json
    patient_id = data.get('patient_id')
    medication_id = data.get('medication_id')
    motor_number = data.get('motor_number')
    intake_time = data.get('intake_time')
    
    prescription_id = PrescriptionService.create_prescription(
        doctor_id=user_id,
        patient_id=patient_id,
        medication_id=medication_id,
        motor_number=motor_number,
        intake_time=intake_time
    )
    
    return jsonify({'success': True, 'prescription_id': prescription_id})

@app.route('/api/prescriptions/<int:prescription_id>/deactivate', methods=['POST'])
def deactivate_prescription(prescription_id):
    """Deactivate a prescription (doctors only)."""
    user_id = session.get('user_id')
    is_doctor = session.get('is_doctor')
    
    if not user_id or not is_doctor:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    success = PrescriptionService.deactivate_prescription(prescription_id)
    
    return jsonify({'success': success})

# Message routes
@app.route('/api/messages', methods=['GET'])
def get_messages():
    """Get messages for the current user."""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    messages = MessageService.get_messages_for_user(user_id)
    
    # Convert messages to dictionaries with additional fields
    message_dicts = []
    for m in messages:
        m_dict = m.to_dict()
        if hasattr(m, 'sender_name'):
            m_dict['sender_name'] = m.sender_name
        if hasattr(m, 'receiver_name'):
            m_dict['receiver_name'] = m.receiver_name
        message_dicts.append(m_dict)
    
    return jsonify({
        'success': True,
        'messages': message_dicts
    })

@app.route('/api/messages', methods=['POST'])
def send_message():
    """Send a message."""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    data = request.json
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    
    message_id = MessageService.send_message(user_id, receiver_id, content)
    
    return jsonify({'success': True, 'message_id': message_id})

@app.route('/api/conversations/<int:user_id>', methods=['GET'])
def get_conversation(user_id):
    """Get conversation between the current user and another user."""
    current_user_id = session.get('user_id')
    
    if not current_user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    messages = MessageService.get_conversation(current_user_id, user_id)
    
    # Mark messages as read
    MessageService.mark_conversation_as_read(user_id, current_user_id)
    
    # Convert messages to dictionaries with additional fields
    message_dicts = []
    for m in messages:
        m_dict = m.to_dict()
        if hasattr(m, 'sender_name'):
            m_dict['sender_name'] = m.sender_name
        if hasattr(m, 'receiver_name'):
            m_dict['receiver_name'] = m.receiver_name
        message_dicts.append(m_dict)
    
    return jsonify({
        'success': True,
        'messages': message_dicts
    })

# Arduino control routes
@app.route('/api/pillbox/control', methods=['POST'])
def control_pillbox():
    """Control a pillbox motor."""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401
    
    data = request.json
    motor_number = data.get('motor_number')
    action = data.get('action')  # 'open' or 'close'
    
    if not motor_number or not action or action not in ['open', 'close']:
        return jsonify({'success': False, 'message': 'Requête invalide'}), 400
    
    success = arduino_service.send_command(motor_number, action)
    
    return jsonify({'success': success})

if __name__ == '__main__':
    # Make sure the static directory exists
    os.makedirs('static', exist_ok=True)
    app.run(debug=True)


    # Add these routes to your app.py file

@app.route('/debug/ping', methods=['GET'])
def debug_ping():
    """Simple endpoint to test if the API is working."""
    return jsonify({'success': True, 'message': 'API is working'})

@app.route('/debug/users', methods=['GET'])
def debug_users():
    """List all users for debugging."""
    users = UserRepository.get_all()
    return jsonify({
        'success': True,
        'users': [{'id': user.id, 'username': user.username, 'is_doctor': user.is_doctor} for user in users]
    })