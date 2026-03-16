from flask import request, jsonify, Blueprint
from utils.role_required import role_required
from utils.jwt_required import token_required
from config.database import get_db
from flask_cors import cross_origin

student_bp = Blueprint("student", __name__, url_prefix="/student")


# =========================
# GET PROFILE
# =========================
@student_bp.route("/profile", methods=["GET", "OPTIONS"])
@cross_origin(origin="http://localhost:3000", supports_credentials=True)
@token_required
@role_required("student")
def get_profile():

    if request.method == "OPTIONS":
        return jsonify({}), 200

    db = get_db()
    user_id = request.user["_id"]

    profile = db.student_profiles.find_one({"user_id": user_id})

    if not profile:
        return jsonify({}), 200

    profile["_id"] = str(profile["_id"])
    profile["user_id"] = str(profile["user_id"])

    return jsonify(profile), 200


# =========================
# CREATE / UPDATE PROFILE
# =========================
@student_bp.route("/profile", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:3000", supports_credentials=True)
@token_required
@role_required("student")
def upsert_profile():

    if request.method == "OPTIONS":
        return jsonify({}), 200

    db = get_db()
    data = request.json
    user_id = request.user["_id"]

    required_fields = ["full_name", "class_name"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Thiếu {field}"}), 400


    profile = {

        "user_id": user_id,
        "full_name": data.get("full_name", ""),
        "student_code": data.get("student_code", ""),
        "class_name": data.get("class_name", ""),

        "birth_date": data.get("birth_date", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "gender": data.get("gender", ""),
        "address": data.get("address", "")
    }


    db.student_profiles.update_one(
        {"user_id": user_id},
        {"$set": profile},
        upsert=True
    )


    db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_profile_completed": True}}
    )

    return jsonify({"message": "Cập nhật hồ sơ thành công"}), 200