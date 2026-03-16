from bson import ObjectId
from flask import Blueprint, jsonify, request
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from werkzeug.security import generate_password_hash
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

# =====================================================
# DASHBOARD
# =====================================================
@admin_bp.route("/dashboard", methods=["GET"])
@token_required
@role_required("admin")
def admin_dashboard():

    db = get_db()

    return jsonify({
        "total_users": db.users.count_documents({}),
        "students": db.users.count_documents({"role": "student"}),
        "teachers": db.users.count_documents({"role": "teacher"}),
        "classes": db.classes.count_documents({}),
        "exams": db.exams.count_documents({}),
        "cheat_logs": db.cheat_logs.count_documents({})
    }), 200


# =====================================================
# GET ALL CLASSES
# =====================================================
@admin_bp.route("/classes", methods=["GET"])
@token_required
@role_required("admin")
def get_all_classes():

    db = get_db()

    search = request.args.get("search", "").lower()
    teacher_id = request.args.get("teacher_id")

    classes = list(db.classes.find())

    result = []

    for c in classes:

        teacher_profile = db.teacher_profiles.find_one({
            "user_id": c.get("teacher_id")
        })

        teacher_name = teacher_profile["full_name"] if teacher_profile else "Chưa cập nhật"

        student_count = db.class_members.count_documents({
            "class_id": c["_id"]
        })

        data = {
            "_id": str(c["_id"]),
            "class_name": c.get("class_name"),
            "subject": c.get("subject"),
            "teacher_name": teacher_name,
            "teacher_id": str(c.get("teacher_id")),
            "student_count": student_count,
            "status": c.get("status", "active")
        }

        # SEARCH FILTER
        if search:
            text = f"{data['class_name']} {data['subject']} {teacher_name}".lower()
            if search not in text:
                continue

        # TEACHER FILTER
        if teacher_id and teacher_id != data["teacher_id"]:
            continue

        result.append(data)

    return jsonify(result), 200

# =====================================================
# GET SIMPLE TEACHER LIST (FOR FILTER)
# =====================================================
@admin_bp.route("/teachers/simple", methods=["GET"])
@token_required
@role_required("admin")
def get_teacher_list():

    db = get_db()

    teachers = list(db.users.find({"role": "teacher"}))

    result = []

    for t in teachers:

        profile = db.teacher_profiles.find_one({
            "user_id": t["_id"]
        })

        result.append({
            "_id": str(t["_id"]),
            "name": profile["full_name"] if profile else t["email"]
        })

    return jsonify(result), 200
# =====================================================
# DELETE CLASS
# =====================================================
@admin_bp.route("/classes/<class_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_class(class_id):

    db = get_db()

    class_obj = db.classes.find_one({"_id": ObjectId(class_id)})

    if not class_obj:
        return jsonify({"message": "Không tìm thấy lớp"}), 404

    db.classes.delete_one({"_id": ObjectId(class_id)})
    db.class_members.delete_many({"class_id": ObjectId(class_id)})
    db.exams.delete_many({"class_id": ObjectId(class_id)})

    return jsonify({"message": "Đã xoá lớp thành công"}), 200


# =====================================================
# TOGGLE CLASS STATUS
# =====================================================
@admin_bp.route("/classes/<class_id>/toggle", methods=["PUT"])
@token_required
@role_required("admin")
def toggle_class(class_id):

    db = get_db()

    classroom = db.classes.find_one({"_id": ObjectId(class_id)})

    if not classroom:
        return jsonify({"message": "Không tìm thấy lớp"}), 404

    new_status = "inactive" if classroom.get("status") == "active" else "active"

    db.classes.update_one(
        {"_id": ObjectId(class_id)},
        {"$set": {"status": new_status}}
    )

    return jsonify({"status": new_status}), 200


# =====================================================
# GET STUDENTS (SUPPORT SEARCH + CLASS FILTER)
# =====================================================
@admin_bp.route("/students", methods=["GET"])
@token_required
@role_required("admin")
def get_students():

    db = get_db()

    search = request.args.get("search")
    class_id = request.args.get("class_id")

    query = {"role": "student"}

    if search:
        query["email"] = {"$regex": search, "$options": "i"}

    students = list(db.users.find(query))

    result = []

    for s in students:

        membership = db.class_members.find_one({
            "student_id": s["_id"]
        })

        class_name = "Chưa vào lớp"
        class_value = None

        if membership:
            classroom = db.classes.find_one({
                "_id": membership["class_id"]
            })

            if classroom:
                class_name = classroom.get("class_name")
                class_value = str(classroom["_id"])

        result.append({
            "_id": str(s["_id"]),
            "email": s.get("email"),
            "status": s.get("status", "active"),
            "class_name": class_name,
            "class_id": class_value,
            "created_at": s.get("created_at"),
            "last_login": s.get("last_login")
        })

    if class_id:
        result = [s for s in result if s["class_id"] == class_id]

    return jsonify(result), 200


# =====================================================
# DELETE STUDENT
# =====================================================
@admin_bp.route("/students/<student_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_student(student_id):

    db = get_db()

    db.class_members.delete_many({
        "student_id": ObjectId(student_id)
    })

    result = db.users.delete_one({
        "_id": ObjectId(student_id),
        "role": "student"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Không tìm thấy học sinh"}), 404

    return jsonify({"message": "Xoá học sinh thành công"}), 200


# =====================================================
# GET TEACHERS
# =====================================================
@admin_bp.route("/teachers", methods=["GET"])
@token_required
@role_required("admin")
def get_teachers():

    db = get_db()

    teachers = list(db.users.find({"role": "teacher"}))

    result = []

    for t in teachers:

        profile = db.teacher_profiles.find_one({
            "user_id": t["_id"]
        })

        result.append({
            "_id": str(t["_id"]),
            "email": t.get("email"),
            "status": t.get("status", "active"),
            "full_name": profile["full_name"] if profile else "Chưa cập nhật",
            "created_at": t.get("created_at"),
            "last_login": t.get("last_login")
        })

    return jsonify(result), 200


# =====================================================
# CREATE TEACHER
# =====================================================
@admin_bp.route("/teachers", methods=["POST"])
@token_required
@role_required("admin")
def create_teacher():

    db = get_db()

    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Thiếu thông tin"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"message": "Email đã tồn tại"}), 400

    db.users.insert_one({
        "email": email,
        "password": generate_password_hash(password),
        "role": "teacher",
        "status": "active",
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "Tạo giáo viên thành công"}), 201


# =====================================================
# DELETE TEACHER
# =====================================================
@admin_bp.route("/teachers/<teacher_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_teacher(teacher_id):

    db = get_db()

    db.teacher_profiles.delete_many({
        "user_id": ObjectId(teacher_id)
    })

    db.classes.delete_many({
        "teacher_id": ObjectId(teacher_id)
    })

    result = db.users.delete_one({
        "_id": ObjectId(teacher_id),
        "role": "teacher"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Không tìm thấy giáo viên"}), 404

    return jsonify({"message": "Xóa giáo viên thành công"}), 200


# =====================================================
# CHEAT LOGS
# =====================================================
@admin_bp.route("/cheat-logs", methods=["GET"])
@token_required
@role_required("admin")
def get_cheat_logs():

    db = get_db()

    logs = list(db.cheat_logs.find().sort("timestamp", -1))

    for log in logs:
        log["_id"] = str(log["_id"])
        log["student_id"] = str(log["student_id"])
        log["exam_id"] = str(log["exam_id"])

    return jsonify(logs), 200
# =====================================================
# GET STUDENTS OF A CLASS + EXAM STATUS
# =====================================================
# @admin_bp.route("/classes/<class_id>/students", methods=["GET"])
# @token_required
# @role_required("admin")
# def get_class_students(class_id):

#     db = get_db()

#     try:
#         class_id = ObjectId(class_id)
#     except:
#         return jsonify({"message": "ID lớp không hợp lệ"}), 400

#     members = list(db.class_members.find({
#         "class_id": class_id
#     }))

#     result = []

#     for m in members:

#         student = db.users.find_one({
#             "_id": m["student_id"]
#         })

#         if not student:
#             continue

#         # kiểm tra sinh viên có làm bài thi không
#         exam = db.exam_results.find_one({
#             "student_id": m["student_id"]
#         })

#         status = "absent"

#         if exam:
#             status = "present"

#         result.append({
#             "_id": str(student["_id"]),
#             "email": student.get("email"),
#             "status": status
#         })

#     return jsonify(result), 200
@admin_bp.route("/classes/<class_id>/exams", methods=["GET"])
@token_required
@role_required("admin")
def get_class_exams(class_id):

    db = get_db()

    exams = list(db.exams.find({
        "class_id": ObjectId(class_id)
    }))

    result = []

    for e in exams:
        result.append({
            "_id": str(e["_id"]),
            "exam_name": e.get("exam_name")
        })

    return jsonify(result), 200
# =====================================================
# GET EXAM REPORT (DANH SÁCH HỌC SINH + TRẠNG THÁI DỰ THI + SỐ LẦN CÓ HÀNH VI GIAN LẬN)
@admin_bp.route("/reports/class-exam/<exam_id>", methods=["GET"])
@token_required
@role_required("admin")
def admin_exam_report(exam_id):

    db = get_db()

    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        return jsonify({"message": "Không tìm thấy bài thi"}), 404

    class_id = exam["class_id"]

    members = list(db.class_members.find({
        "class_id": class_id
    }))

    result = []

    for m in members:

        student_id = m["student_id"]

        user = db.users.find_one({
            "_id": student_id
        })

        profile = db.student_profiles.find_one({
            "user_id": student_id
        })

        # ===== KẾT QUẢ =====
        exam_result = db.results.find_one({
            "exam_id": ObjectId(exam_id),
            "student_id": student_id
        })

        # ===== GIAN LẬN =====
        cheat_count = db.cheat_logs.count_documents({
            "exam_id": ObjectId(exam_id),
            "student_id": student_id
        })

        status = "absent"
        point = None
        cancelled = False

        if exam_result:
            status = "present"
            point = exam_result.get("point")
            cancelled = exam_result.get("is_cancelled", False)

        result.append({
            "student_id": str(student_id),
            "email": user.get("email"),
            "student_name": profile.get("full_name") if profile else "",
            "student_code": profile.get("student_code") if profile else "",
            "status": status,
            "point": point,
            "is_cancelled": cancelled,
            "cheat_count": cheat_count
        })

    return jsonify(result), 200