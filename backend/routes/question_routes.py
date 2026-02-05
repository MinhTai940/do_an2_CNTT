from flask import Blueprint, request, jsonify
from config.database import get_db

question_bp = Blueprint("question", __name__)
# Khai báo các routes liên quan đến câu hỏi ở đây
@question_bp.route("/create", methods=["POST"])
def create_question():
    data = request.json
    db = get_db()

    question = {
        "exam_id": data.get("exam_id"),
        "content": data.get("content"),
        "options": data.get("options"),   # list đáp án
        "correct_answer": data.get("correct_answer")
    }

    db.questions.insert_one(question)

    return jsonify({
        "message": "Question added successfully"
    }), 201
#API LẤY CÂU HỎI ĐỂ HỌC SINH LÀM BÀI
@question_bp.route("/exam/<exam_id>", methods=["GET"])
def get_questions_by_exam(exam_id):
    db = get_db()

    questions = list(db.questions.find(
        {"exam_id": exam_id},
        {"_id": 0, "correct_answer": 0}   # ❗ không trả đáp án đúng
    ))

    return jsonify(questions), 200
