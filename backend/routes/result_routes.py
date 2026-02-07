from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required
from bson import ObjectId
from flask_cors import cross_origin

result_bp = Blueprint("result", __name__)

@result_bp.route("/submit", methods=["POST"])
@cross_origin(origin="http://localhost:3000")
@token_required
@role_required("student")
def submit_exam():
    data = request.json
    db = get_db()

    # ✅ LẤY DATA
    exam_id_str = data.get("exam_id")          # string từ frontend
    answers = data.get("answers", {})
    student_id = request.user["user_id"]       # ObjectId từ token

    exam_id = ObjectId(exam_id_str)

    # ✅ LẤY CÂU HỎI
    questions = list(db.questions.find({"exam_id": exam_id}))

    # ✅ CHẤM ĐIỂM
    score = 0
    for q in questions:
        qid = str(q["_id"])  # key frontend gửi lên
        if answers.get(qid) == q.get("correct_index"):
            score += 1

    # ✅ LƯU DB (ObjectId)
    db.results.insert_one({
        "student_id": student_id,
        "exam_id": exam_id,
        "score": score,
        "total": len(questions)
    })

    # ✅ TRẢ JSON (string)
    return jsonify({
        "student_id": str(student_id),
        "exam_id": exam_id_str,
        "score": score,
        "total": len(questions)
    }), 200
