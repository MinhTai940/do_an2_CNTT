from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from bson import ObjectId
from datetime import datetime

result_bp = Blueprint("result", __name__)

MAX_VIOLATIONS = 5

@result_bp.route("/submit", methods=["POST"])
@token_required
@role_required("student")
def submit_exam():
    db = get_db()
    data = request.json

    exam_id = ObjectId(data.get("exam_id"))
    answers = data.get("answers", {})
    student_id = request.user["_id"]

    exam = db.exams.find_one({
        "_id": exam_id,
        "status": "active"
    })

    if not exam:
        return jsonify({"message": "Đề thi không tồn tại"}), 404

    existed = db.results.find_one({
        "exam_id": exam_id,
        "student_id": student_id
    })

    if existed:
        return jsonify({"message": "Bạn đã nộp bài rồi"}), 400

    questions = list(db.questions.find({"exam_id": exam_id}))

    score = 0
    correct_answers = {}

    for q in questions:
        qid = str(q["_id"])
        correct_index = q.get("correct_index")

        correct_answers[qid] = correct_index

        if str(answers.get(qid)) == str(correct_index):
            score += 1

    total = len(questions)
    point = round((score / total) * 10, 1) if total > 0 else 0

    # 🔥 ĐẾM GIAN LẬN
    cheat_count = db.cheat_logs.count_documents({
        "exam_id": exam_id,
        "student_id": student_id
    })

    is_cancelled = cheat_count >= MAX_VIOLATIONS

    # # 🔥 NẾU BỊ HUỶ → ĐIỂM = 0
    # if is_cancelled:
    #     score = 0
    #     point = 0

    db.results.insert_one({
        "student_id": student_id,
        "exam_id": exam_id,
        "score": score,
        "total": total,
        "point": point,
        "cheat_count": cheat_count,
        "is_cancelled": is_cancelled,
        "submitted_at": datetime.utcnow()
    })

    return jsonify({
        "score": score,
        "total": total,
        "point": point,
        "cheat_count": cheat_count,
        "is_cancelled": is_cancelled
    }), 200


# ======================================================
# 2️⃣ API: LẤY KẾT QUẢ THEO EXAM
# ======================================================
@result_bp.route("/student/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def get_result_by_exam(exam_id):
    db = get_db()
    student_id = request.user["_id"]

    result = db.results.find_one({
        "exam_id": ObjectId(exam_id),
        "student_id": student_id
    })

    if not result:
        return jsonify({"message": "Chưa có kết quả"}), 404

    score = result.get("score", 0)
    total = result.get("total", 0)
    point = result.get("point")

    if point is None:
        point = round((score / total) * 10, 1) if total > 0 else 0

    return jsonify({
        "score": score,
        "total": total,
        "point": point,
        "cheat_count": result.get("cheat_count", 0),
        "is_cancelled": result.get("is_cancelled", False)
    }), 200


# ======================================================
# 3️⃣ API: LẤY TẤT CẢ KẾT QUẢ CỦA SINH VIÊN
# ======================================================
@result_bp.route("/student", methods=["GET"])
@token_required
@role_required("student")
def get_all_results():
    db = get_db()
    student_id = request.user["_id"]

    results = list(
        db.results.find({"student_id": student_id})
        .sort("submitted_at", -1)
    )

    formatted_results = []

    for r in results:
        exam = db.exams.find_one({"_id": r["exam_id"]})
        mode = exam.get("mode", "easy") if exam else "easy"

        score = r.get("score", 0)
        total = r.get("total", 0)
        point = r.get("point")

        if point is None:
            point = round((score / total) * 10, 1) if total > 0 else 0

        formatted_results.append({
            "_id": str(r["_id"]),
            "exam_id": str(r["exam_id"]),
            "exam_title": exam.get("exam_name") if exam else "Không xác định",
            "mode": mode, 
            "score": r.get("score", 0),
            "total": r.get("total", 0),
            "point": point,
            "cheat_count": r.get("cheat_count", 0),
            "is_cancelled": r.get("is_cancelled", False),
            "submitted_at": r.get("submitted_at").isoformat()
            })
    return jsonify(formatted_results), 200


# ======================================================
# 4️⃣ API: HỌC SINH XEM LẠI BÀI
# ======================================================
@result_bp.route("/student/review/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def review_exam(exam_id):
    db = get_db()
    student_id = request.user["_id"]
    exam_id_obj = ObjectId(exam_id)

    result = db.results.find_one({
        "exam_id": exam_id_obj,
        "student_id": student_id
    })

    if not result:
        return jsonify({"message": "Không tìm thấy kết quả"}), 404

    questions = list(db.questions.find({"exam_id": exam_id_obj}))

    score = result.get("score", 0)
    total = result.get("total", 0)
    point = result.get("point")

    if point is None:
        point = round((score / total) * 10, 1) if total > 0 else 0

    question_list = []

    for q in questions:
        qid = str(q["_id"])

        question_list.append({
            "question_id": qid,
            "content": q.get("content"),
            "options": q.get("options"),
            "correct_index": q.get("correct_index"),
            "student_answer": result.get("answers", {}).get(qid)
        })

    return jsonify({
        "score": score,
        "total": total,
        "point": point,
        "submitted_at": result.get("submitted_at").isoformat()
            if result.get("submitted_at") else None,
        "questions": question_list
    }), 200