from functools import wraps
from flask import request, jsonify

def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user = getattr(request, "user", None)

            if not user or user.get("role") != role:
                return jsonify({"message": "Permission denied"}), 403

            return f(*args, **kwargs)
        return wrapped
    return decorator
