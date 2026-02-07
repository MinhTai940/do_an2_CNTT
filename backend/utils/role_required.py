from functools import wraps
from flask import request, jsonify


def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if request.method == "OPTIONS":
                return f(*args, **kwargs)

            if not hasattr(request, "user"):
                return jsonify({"message": "Unauthorized"}), 401

            if request.user.get("role") != role:
                return jsonify({"message": "Permission denied"}), 403

            return f(*args, **kwargs)

        return decorated
    return decorator

