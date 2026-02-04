from flask import Blueprint, request, jsonify
from config.database import get_db

exam_bp = Blueprint("exam", __name__)
#API 1 – GIÁO VIÊN TẠO ĐỀ THI CHO LỚP
@exam_bp.route("/create", methods=["POST"])
def create_exam():
    data = request.json
    db = get_db()

    new_exam = {
        "exam_name": data.get("exam_name"),
        "class_id": data.get("class_id"),
        "duration": data.get("duration"),   # phút
        "teacher_id": data.get("teacher_id"),
        "status": "active"
    }

    db.exams.insert_one(new_exam)

    return jsonify({
        "message": "Exam created successfully"
    }), 201
#API 2 – HỌC SINH LẤY DANH SÁCH ĐỀ THI THEO LỚP
@exam_bp.route("/class/<class_id>", methods=["GET"])
def get_exams_by_class(class_id):
    db = get_db()

    exams = list(db.exams.find(
        {"class_id": class_id},
        {"_id": 0}
    ))

    return jsonify(exams), 200
