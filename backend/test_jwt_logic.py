import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)

from app import app
from config.db import get_db
from flask_jwt_extended import decode_token

# Test user credentials
TEST_EMAIL = "jwt_test_user@example.com"
TEST_NAME = "JWT Test User"
TEST_PWD = "testpassword123"

def clean_test_user(db):
    with db.cursor() as cur:
        cur.execute("DELETE FROM users WHERE email = %s", (TEST_EMAIL,))

def main():
    print("--- STARTING JWT REFRESH LOGIC TEST ---")
    db = get_db()
    
    # 1. Clean up potential old test user
    clean_test_user(db)
    
    # Use Flask test client
    client = app.test_client()
    
    with app.app_context():
        # 2. Register test user
        print("\n1. Registering test user...")
        reg_resp = client.post("/api/auth/register", json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PWD
        })
        
        if reg_resp.status_code != 201:
            print(f"FAILED to register user: {reg_resp.get_json()}")
            sys.exit(1)
            
        reg_data = reg_resp.get_json()
        user_id = reg_data["user"]["id"]
        token1 = reg_data["token"]
        print(f"Registered successfully! User ID: {user_id}")
        
        # Decode token1 to inspect claims
        claims1 = decode_token(token1)
        print(f"Token 1 claims: role={claims1.get('role')}, plan_status={claims1.get('plan_status')}")
        
        # 3. Call /me with token1 - should match exactly, NO new token should be returned
        print("\n2. Calling /me with unchanged DB status...")
        me_resp1 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token1}"})
        me_data1 = me_resp1.get_json()
        print(f"/me response keys: {list(me_data1.keys())}")
        assert "token" not in me_data1, "Token was refreshed when it shouldn't have been!"
        print("Passed: No token refresh triggered when database matches claims.")

        # 4. Modify role and plan_status in database to simulate payment success callback
        print("\n3. Simulating payment webhook: updating DB status to role='pro', plan_status='active'...")
        with db.cursor() as cur:
            cur.execute(
                "UPDATE users SET role='pro', plan_status='active' WHERE id = %s",
                (user_id,)
            )
        
        # 5. Call /me with token1 again - should trigger refresh and return token2
        print("\n4. Calling /me with updated DB status...")
        me_resp2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token1}"})
        me_data2 = me_resp2.get_json()
        
        print(f"/me response keys: {list(me_data2.keys())}")
        assert "token" in me_data2, "Token refresh WAS NOT triggered when claims mismatched DB!"
        print("Passed: Token refresh was triggered successfully!")
        
        token2 = me_data2["token"]
        claims2 = decode_token(token2)
        print(f"Token 2 claims: role={claims2.get('role')}, plan_status={claims2.get('plan_status')}")
        
        assert claims2.get("role") == "pro", "New token claim 'role' should be 'pro'!"
        assert claims2.get("plan_status") == "active", "New token claim 'plan_status' should be 'active'!"
        print("Passed: New token claims match updated database values!")
        
        # 6. Call /me with token2 - should match exactly, NO new token should be returned
        print("\n5. Calling /me with token2...")
        me_resp3 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token2}"})
        me_data3 = me_resp3.get_json()
        assert "token" not in me_data3, "Token was refreshed again unexpectedly!"
        print("Passed: Token is stable once database values and claims are aligned.")
        
        # Clean up test user
        clean_test_user(db)
        db.close()
    
    print("\n--- ALL JWT REFRESH LOGIC TESTS PASSED ---")

if __name__ == "__main__":
    main()
