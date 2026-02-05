from flask import Blueprint, request, jsonify
from config.database import get_db
from datetime import datetime
from utils.auth_middleware import token_required
from utils.role_required import role_required

cheat_bp = Blueprint("cheat", __name__)
# API GHI NHỚ HÀNH VI GIAN LẬN
@cheat_bp.route("/log", methods=["POST"])
@token_required
@role_required("student")
def log_cheat():
    data = request.json
    db = get_db()

    cheat_log = {
        "student_id": data.get("student_id"),
        "exam_id": data.get("exam_id"),
        "action": data.get("action"),  # tab_switch, copy, fullscreen_exit...
        "timestamp": datetime.utcnow()
    }

    db.cheat_logs.insert_one(cheat_log)

    return jsonify({
        "message": "Cheat log saved"
    }), 201
# API LẤY LOG GIAN LẬN THEO BÀI THI
@cheat_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def get_cheat_logs(exam_id):
    db = get_db()

    logs = list(db.cheat_logs.find(
        {"exam_id": exam_id},
        {"_id": 0}
    ))

    return jsonify(logs), 200
