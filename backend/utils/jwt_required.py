import jwt
import os
from functools import wraps
from flask import request, jsonify
from config.database import get_db
from bson import ObjectId
SECRET_KEY = os.getenv("SECRET_KEY", "secret123")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # ✅ BỎ QUA OPTIONS
        if request.method == "OPTIONS":
            return "", 200
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Missing token"}), 401

        # Nếu header dạng: "Bearer xxx"
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(data["user_id"])})

            if not user:
                return jsonify({"message": "User not found"}), 401

            # 🔥 GẮN USER VÀO REQUEST
            request.user = {
                "_id": user["_id"],
                "email": user["email"],
                "role": user["role"]
            }

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated
