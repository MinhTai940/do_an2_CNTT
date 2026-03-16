from flask import Blueprint, request, jsonify
from utils.jwt_required import token_required
from utils.role_required import role_required
from config.database import get_db
from datetime import datetime

teacher_bp = Blueprint("teacher", __name__, url_prefix="/teacher")


# =====================================
# GET – LẤY THÔNG TIN GIÁO VIÊN
# =====================================
@teacher_bp.route("/profile", methods=["GET"])
@token_required
@role_required("teacher")
def get_teacher_profile():
    db = get_db()
    user_id = request.user["_id"]

    profile = db.teacher_profiles.find_one({"user_id": user_id})

    if not profile:
        return jsonify({
            "full_name": "",
            "teacher_code": "",
            "subject": "",
            "dob": "",
            "email": "",
            "phone": "",
            "gender": "",
            "address": ""
        }), 200

    profile["_id"] = str(profile["_id"])
    profile["user_id"] = str(profile["user_id"])

    return jsonify(profile), 200


# =====================================
# PUT – CẬP NHẬT THÔNG TIN GIÁO VIÊN
# =====================================
@teacher_bp.route("/profile", methods=["PUT"])
@token_required
@role_required("teacher")
def update_teacher_profile():
    db = get_db()
    user_id = request.user["_id"]
    data = request.json

    required_fields = ["full_name", "teacher_code", "subject"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Thiếu {field}"}), 400

    update_data = {
        "user_id": user_id,
        "full_name": data.get("full_name"),
        "teacher_code": data.get("teacher_code"),
        "subject": data.get("subject"),
        "dob": data.get("dob"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "gender": data.get("gender"),
        "address": data.get("address"),
        "updated_at": datetime.utcnow()
    }

    db.teacher_profiles.update_one(
        {"user_id": user_id},
        {"$set": update_data},
        upsert=True
    )

    return jsonify({"message": "Cập nhật thành công"}), 200