from flask import Blueprint, jsonify
from config.database import get_db

test_bp = Blueprint("test", __name__)

@test_bp.route("/", methods=["GET"])
def test():
    db = get_db()
    return jsonify({
        "message": "Backend + MongoDB connected successfully!"
    })
