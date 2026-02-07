from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required
from bson import ObjectId


exam_bp = Blueprint("exam", __name__)
#API 1 – GIÁO VIÊN TẠO ĐỀ THI CHO LỚP
@exam_bp.route("/create", methods=["POST"])
@token_required
@role_required("teacher")
def create_exam():
    data = request.json
    db = get_db()

    new_exam = {
        "exam_name": data.get("exam_name"),
        "class_id": ObjectId(data.get("class_id")),  # ✅ QUAN TRỌNG
        "duration": data.get("duration"),
        "teacher_id": request.user["user_id"],
        "status": "active"
    }

    db.exams.insert_one(new_exam)
    return jsonify({"message": "Exam created successfully"}), 201
#API 2 – HỌC SINH LẤY DANH SÁCH ĐỀ THI THEO LỚP
@exam_bp.route("/teacher/class/<class_id>", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_get_exams_by_class(class_id):
    db = get_db()

    exams = list(db.exams.find({
        "class_id": ObjectId(class_id)
    }))

    for e in exams:
        e["_id"] = str(e["_id"])
        e["class_id"] = str(e["class_id"])

    return jsonify(exams), 200
#API: Học sinh xem danh sách đề thi của lớp
@exam_bp.route("/student/class/<class_id>", methods=["GET"])
@token_required
@role_required("student")
def student_get_exams_by_class(class_id):
    db = get_db()

    exams = list(db.exams.find({
        "class_id": ObjectId(class_id),
        "status": "active"
    }))

    for e in exams:
        e["_id"] = str(e["_id"])
        e["class_id"] = str(e["class_id"])

    return jsonify(exams), 200
#API lấy chi tiết đề thi
@exam_bp.route("/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_get_exam_detail(exam_id):
    db = get_db()

    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        return jsonify({"message": "Exam not found"}), 404

    exam["_id"] = str(exam["_id"])
    exam["class_id"] = str(exam["class_id"])

    return jsonify(exam), 200
#API lấy chi tiết đề thi cho học sinh
@exam_bp.route("/student/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def student_get_exam_detail(exam_id):
    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id),
        "status": "active"
    })

    if not exam:
        return jsonify({"message": "Exam not found"}), 404

    return jsonify({
        "_id": str(exam["_id"]),
        "exam_name": exam["exam_name"],
        "duration": exam["duration"]
    }), 200


    

