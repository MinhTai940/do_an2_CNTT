import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY", "secret123")

def generate_token(user):
    payload = {
    "user_id": str(user["_id"]),
    "email": user["email"],   # ✅ ĐÚNG
    "role": user["role"],
    "exp": datetime.utcnow() + timedelta(hours=6)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
