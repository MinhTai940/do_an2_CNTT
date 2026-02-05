from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required

result_bp = Blueprint("result", __name__)
# Khai báo các routes liên quan đến kết quả ở đây
@result_bp.route("/submit", methods=["POST"])
@token_required
@role_required("student")
def submit_exam():
    data = request.json
    db = get_db()

    answers = data.get("answers")
    exam_id = data.get("exam_id")
    student_id = data.get("student_id")

    questions = list(db.questions.find({"exam_id": exam_id}))

    score = 0
    for q in questions:
        question_key = q["content"]
        if answers.get(question_key) == q["correct_answer"]:
            score += 1

    result = {
        "student_id": student_id,
        "exam_id": exam_id,
        "score": score,
        "total": len(questions)
    }

    db.results.insert_one(result)

    return jsonify({
    "student_id": student_id,
    "exam_id": exam_id,
    "score": score,
    "total": len(questions)
}), 200