from flask import Blueprint, request, jsonify
from config.database import get_db
from services.ai_service import analyze_image
from datetime import datetime
from bson import ObjectId
from utils.jwt_required import token_required
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
        "student_id": request.user["_id"],       # ObjectId
        "exam_id": ObjectId(data.get("exam_id")),
        "action": data.get("action"),                # tab_switch, copy,...
        "timestamp": datetime.utcnow()
    }

    db.cheat_logs.insert_one(cheat_log)

    return jsonify({"message": "Cheat logged"}), 201
# API LẤY LOG GIAN LẬN THEO BÀI THI
@cheat_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def get_cheat_logs(exam_id):
    db = get_db()

    logs = list(db.cheat_logs.find(
        {"exam_id": ObjectId(exam_id)},
        {"_id": 0}
    ))

    # convert ObjectId student_id -> string
    for l in logs:
        l["student_id"] = str(l["student_id"])

    return jsonify(logs), 200
# API LƯU ẢNH CAMERA GIAN LẬN
@cheat_bp.route("/camera-frame", methods=["POST"])
@token_required
def save_camera_frame():
    db = get_db()
    data = request.json

    db.cheat_camera_frames.insert_one({
        "exam_id": ObjectId(data["exam_id"]),
        "student_id": request.user["_id"],
        "image": data["image"],
        "analyzed": False,
        "violations": [],
        "timestamp": datetime.utcnow()
    })

    return jsonify({"message": "Frame saved"}), 200
# API PHÂN TÍCH ẢNH CAMERA GIAN LẬN
@cheat_bp.route("/analyze-pending", methods=["POST"])
@token_required
@role_required("student")  # hoặc bỏ nếu muốn student gọi
def analyze_pending():
    db = get_db()

    frames = db.cheat_camera_frames.find({
    "analyzed": False,
    "exam_id": ObjectId(request.json.get("exam_id"))
    })

    for frame in frames:
        violations = analyze_image(frame["image"])

        if violations:
            db.cheat_logs.insert_one({
                "exam_id": frame["exam_id"],
                "student_id": frame["student_id"],
                "action": "ai_violation",
                "details": violations,
                "timestamp": datetime.utcnow()
            })

        db.cheat_camera_frames.update_one(
            {"_id": frame["_id"]},
            {"$set": {
                "analyzed": True,
                "violations": violations
            }}
        )

    return jsonify({"message": "Analyzed"})
# API LẤY VI PHẠM AI CỦA CHÍNH SINH VIÊN
@cheat_bp.route("/my-violations/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def get_my_ai_violations(exam_id):
    db = get_db()

    logs = list(db.cheat_logs.find({
        "exam_id": ObjectId(exam_id),
        "student_id": request.user["_id"],
        "action": "ai_violation"
    }))

    result = []

    for log in logs:
        result.append({
            "details": log.get("details", []),
            "timestamp": log.get("timestamp")
        })

    return jsonify(result), 200
