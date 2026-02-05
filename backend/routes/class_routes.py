from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required
import random
import string

class_bp = Blueprint("class", __name__)

# Hàm sinh mã lớp
def generate_class_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

#API giáo viên
@class_bp.route("/create", methods=["POST"])
@token_required
@role_required("teacher")
def create_class():
    data = request.json
    db = get_db()

    class_code = generate_class_code()

    new_class = {
        "class_name": data.get("class_name"),
        "subject": data.get("subject"),
        "teacher_id": data.get("teacher_id"),
        "class_code": class_code,
        "status": "active"
    }

    db.classes.insert_one(new_class)

    return jsonify({
        "message": "Class created successfully",
        "class_code": class_code
    }), 201
#API học sinh
@class_bp.route("/join", methods=["POST"])
@token_required
@role_required("student")
def join_class():
    data = request.json
    db = get_db()

    class_code = data.get("class_code")
    student_id = request.user["user_id"]

    classroom = db.classes.find_one({"class_code": class_code})

    if not classroom:
        return jsonify({"message": "Invalid class code"}), 404

    db.class_members.insert_one({
        "class_id": str(classroom["_id"]),
        "student_id": student_id
    })

    return jsonify({"message": "Joined class successfully"}), 200
#AIP lấy danh sách lớp học của giáo viên
@class_bp.route("/student/me", methods=["GET"])
def get_my_classes():
    db = get_db()
    student_id = request.user["user_id"]

    memberships = db.class_members.find({"student_id": student_id})
    class_ids = [m["class_id"] for m in memberships]

    classes = list(db.classes.find({"_id": {"$in": class_ids}}, {"_id": 0}))

    return jsonify(classes), 200


