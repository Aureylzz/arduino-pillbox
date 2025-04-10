import sqlite3
import os

def get_db_connection():
    """Get a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect('pillbox.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with the schema."""
    # Check if database exists
    if os.path.exists('pillbox.db'):
        print("Database already exists. Skipping initialization.")
        return
    
    # Create a new database
    conn = get_db_connection()
    
    # Read the schema file
    with open('schema.sql', 'r') as f:
        conn.executescript(f.read())
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()