import sys
import os

# Add parent dir to path so we can import from config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)

from config.db import get_db

db = get_db()
try:
    with db.cursor() as cur:
        # Check if the test user already exists and delete it
        cur.execute("DELETE FROM users WHERE email = 'test_reg@gmail.com'")
        
        # Test insert query
        cur.execute(
            "INSERT INTO users (name, email, password, slug, role, plan_status) "
            "VALUES (%s, %s, %s, %s, 'basic', NULL)",
            ("Test Name", "test_reg@gmail.com", "hashed_pwd", "test-slug"),
        )
        # Rollback or let autocommit take care of it
    print("Test Insert: SUCCESSFUL!")
except Exception as e:
    print(f"Test Insert: FAILED! Error: {e}")
finally:
    db.close()
