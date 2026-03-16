from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from bson import ObjectId
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
    "teacher_id": request.user["_id"],  # ✅ LẤY TỪ TOKEN
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
    student_id = request.user["_id"]

    classroom = db.classes.find_one({"class_code": class_code})

    if not classroom:
        return jsonify({"message": "Invalid class code"}), 404

    db.class_members.insert_one({
    "class_id": classroom["_id"],   # ✅ ObjectId
    "student_id": student_id
})

    return jsonify({"message": "Joined class successfully"}), 200
#AIP lấy danh sách lớp học của giáo viên
@class_bp.route("/student/me", methods=["GET"])
@token_required
@role_required("student")
def get_my_classes_student():
    db = get_db()
    student_id = request.user["_id"]

    memberships = list(db.class_members.find({"student_id": student_id}))

    class_ids = [m["class_id"] for m in memberships]  # ObjectId

    classes = list(db.classes.find(
        {"_id": {"$in": class_ids}},
        {"class_name": 1, "subject": 1}
    ))

    for c in classes:
        c["_id"] = str(c["_id"])

    return jsonify(classes), 200
#API lấy danh sách lớp học của giáo viên
@class_bp.route("/teacher/me", methods=["GET"])
@token_required
@role_required("teacher")
def get_my_classes_teacher():
    db = get_db()
    teacher_id = request.user["_id"]

    classes = list(db.classes.find(
        {"teacher_id": teacher_id}
    ))

    result = []

    for c in classes:
        result.append({
            "_id": str(c["_id"]),
            "class_name": c.get("class_name"),
            "subject": c.get("subject"),
            "class_code": c.get("class_code"),
            "status": c.get("status", "active")
        })

    return jsonify(result), 200


# ==========================
# DELETE CLASS (TEACHER)
# ==========================
@class_bp.route("/<class_id>", methods=["DELETE"])
@token_required
@role_required("teacher")
def delete_class(class_id):
    db = get_db()

    classroom = db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": request.user["_id"]
    })

    if not classroom:
        return jsonify({"message": "Không tìm thấy lớp"}), 404

    # Xóa lớp
    db.classes.delete_one({"_id": ObjectId(class_id)})

    # Xóa học sinh trong lớp
    db.class_members.delete_many({
        "class_id": ObjectId(class_id)
    })

    # Xóa các đề thi của lớp
    db.exams.delete_many({
        "class_id": ObjectId(class_id)
    })

    return jsonify({"message": "Đã xoá lớp thành công"}), 200
# ==========================
# GET STUDENTS IN CLASS (TEACHER)
# ==========================
@class_bp.route("/teacher/<class_id>/students", methods=["GET"])
@token_required
@role_required("teacher")
def get_students_by_class(class_id):

    db = get_db()

    members = list(db.class_members.find({
        "class_id": ObjectId(class_id)
    }))

    result = []

    for m in members:

        user = db.users.find_one({
            "_id": m["student_id"]
        })

        profile = db.student_profiles.find_one({
            "user_id": m["student_id"]
        })

        result.append({

            "student_id": str(m["student_id"]),

            "student_code": profile.get("student_code") if profile else "",

            "full_name": profile.get("full_name") if profile else "",

            "gender": profile.get("gender") if profile else "",

            "dob": profile.get("dob") if profile else "",

            "email": user.get("email") if user else ""

        })

    return jsonify(result), 200

# ==========================
# ADD STUDENT TO CLASS (TEACHER)
# ==========================
@class_bp.route("/add-student", methods=["POST"])
@token_required
@role_required("teacher")
def add_student():

    db = get_db()

    data = request.json

    class_id = data.get("class_id")
    student_code = data.get("student_code")
    name = data.get("name")
    email = data.get("email")
    gender = data.get("gender")

    if not class_id:
        return jsonify({"message": "Missing class_id"}), 400

    # ======================
    # TẠO USER
    # ======================

    user = db.users.find_one({"email": email})

    if user:
        user_id = user["_id"]
    else:
        user_id = db.users.insert_one({
            "email": email,
            "role": "student"
        }).inserted_id

    # ======================
    # TẠO PROFILE
    # ======================

    profile = db.student_profiles.find_one({"user_id": user_id})

    if not profile:
        dob = data.get("dob")

        db.student_profiles.insert_one({
            "user_id": user_id,
            "student_code": student_code,
            "full_name": name,
            "gender": gender,
            "dob": dob
        })

    # ======================
    # THÊM VÀO LỚP
    # ======================

    existed = db.class_members.find_one({
        "class_id": ObjectId(class_id),
        "student_id": user_id
    })

    if existed:
        return jsonify({"message": "Student already in class"}), 400

    db.class_members.insert_one({
        "class_id": ObjectId(class_id),
        "student_id": user_id
    })

    return jsonify({"message": "Student added successfully"}), 200