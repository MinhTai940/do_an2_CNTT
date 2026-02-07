from flask import Blueprint, jsonify, request
from config.database import get_db
from utils.auth_middleware import token_required
from utils.role_required import role_required
from bson import ObjectId

report_bp = Blueprint("report", __name__)
# API LẤY BÁO CÁO KẾT QUẢ THEO BÀI THI
@report_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_exam_results(exam_id):
    db = get_db()

    results = list(db.results.find(
        {"exam_id": ObjectId(exam_id)},
        {"_id": 0}
    ))

    return jsonify(results), 200
# API LẤY BÁO CÁO KẾT QUẢ THEO HỌC SINH
@report_bp.route("/student/<student_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_student_results(student_id):
    db = get_db()

    results = list(db.results.find(
        {"student_id": student_id},
        {"_id": 0}
    ))

    return jsonify(results), 200
# API LẤY BÁO CÁO TỔNG QUÁT KẾT QUẢ
@report_bp.route("/cheat/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
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
@token_required
@role_required("teacher")
def exam_summary(exam_id):
    db = get_db()

    results = list(db.results.find({"exam_id": ObjectId(exam_id)},
    {"_id": 0}))
    total_students = len(results)

    if total_students == 0:
        return jsonify({"message": "No data"}), 200

    avg_score = sum(r["score"] for r in results) / total_students

    return jsonify({
    "exam_id": exam_id,
    "total_students": len(results),
    "results": results
}), 200

#API bổ sung giáo viên dashboard summary
@report_bp.route("/teacher/summary", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_dashboard_summary():
    db = get_db()
    teacher_id = request.user["user_id"]

    class_count = db.classes.count_documents({"teacher_id": teacher_id})
    exam_count = db.exams.count_documents({"teacher_id": teacher_id})
    question_count = db.questions.count_documents({})

    return jsonify({
        "classes": class_count,
        "exams": exam_count,
        "questions": question_count
    }), 200
# API bổ sung sinh viên dashboard summary
@report_bp.route("/student/summary", methods=["GET"])
@token_required
@role_required("student")
def student_dashboard_summary():
    db = get_db()
    student_id = request.user["user_id"]

    class_count = db.class_members.count_documents({"student_id": student_id})
    exam_done = db.results.count_documents({"student_id": student_id})

    return jsonify({
        "classes": class_count,
        "exams_done": exam_done
    }), 200


