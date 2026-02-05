from flask import Blueprint, jsonify
from config.database import get_db

report_bp = Blueprint("report", __name__)
# API LẤY BÁO CÁO KẾT QUẢ THEO BÀI THI
@report_bp.route("/exam/<exam_id>", methods=["GET"])
def report_exam_results(exam_id):
    db = get_db()

    results = list(db.results.find(
        {"exam_id": exam_id},
        {"_id": 0}
    ))

    return jsonify(results), 200
# API LẤY BÁO CÁO KẾT QUẢ THEO HỌC SINH
@report_bp.route("/student/<student_id>", methods=["GET"])
def report_student_results(student_id):
    db = get_db()

    results = list(db.results.find(
        {"student_id": student_id},
        {"_id": 0}
    ))

    return jsonify(results), 200
# API LẤY BÁO CÁO TỔNG QUÁT KẾT QUẢ
@report_bp.route("/cheat/<exam_id>", methods=["GET"])
def report_cheat_exam(exam_id):
    db = get_db()

    pipeline = [
        {"$match": {"exam_id": exam_id}},
        {"$group": {
            "_id": "$student_id",
            "count": {"$sum": 1}
        }}
    ]

    data = list(db.cheat_logs.aggregate(pipeline))

    result = [
        {"student_id": d["_id"], "cheat_count": d["count"]}
        for d in data
    ]

    return jsonify(result), 200
# API LẤY BÁO CÁO TỔNG QUÁT GIAN LẬN
@report_bp.route("/exam/<exam_id>/summary", methods=["GET"])
def exam_summary(exam_id):
    db = get_db()

    results = list(db.results.find({"exam_id": exam_id}))
    total_students = len(results)

    if total_students == 0:
        return jsonify({"message": "No data"}), 200

    avg_score = sum(r["score"] for r in results) / total_students

    return jsonify({
        "exam_id": exam_id,
        "total_students": total_students,
        "average_score": round(avg_score, 2)
    }), 200
