from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required
from bson import ObjectId



question_bp = Blueprint("question", __name__)
# Khai báo các routes liên quan đến câu hỏi ở đây
@question_bp.route("/create", methods=["POST"])
@token_required
@role_required("teacher")
def create_question():
    data = request.json
    db = get_db()

    question = {
        "exam_id": ObjectId(data.get("exam_id")),  # ✅ FIX
        "content": data.get("content"),
        "options": data.get("options"),   # list đáp án
        "correct_index": data.get("correct_index"),
         "level": data.get("level", "medium")     # easy | medium | hard
    }

    db.questions.insert_one(question)

    return jsonify({
        "message": "Question added successfully"
    }), 201
#API LẤY CÂU HỎI ĐỂ HỌC SINH LÀM BÀI
@question_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def get_questions_by_exam(exam_id):
    db = get_db()

    questions = list(db.questions.find(
    {"exam_id": ObjectId(exam_id)},  # ✅ FIX
    {"_id": 1, "content": 1, "options": 1}
    ))

    for q in questions:
        q["_id"] = str(q["_id"])

    return jsonify(questions), 200
#API LẤY CÂU HỎI THEO ĐỀ THI (GIÁO VIÊN QUẢN LÝ)
@question_bp.route("/exam/<exam_id>/teacher", methods=["GET"])
@token_required
@role_required("teacher")
def get_questions_by_exam_teacher(exam_id):
    db = get_db()

    questions = list(db.questions.find({
        "exam_id": ObjectId(exam_id)
    }))

    for q in questions:
        q["_id"] = str(q["_id"])
        q["exam_id"] = str(q["exam_id"])
    return jsonify(questions), 200

