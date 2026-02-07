from functools import wraps
from flask import request, jsonify
import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "secret123")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return f(*args, **kwargs)
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"]
            if token.startswith("Bearer "):
                token = token.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated
