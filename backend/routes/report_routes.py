from flask import Blueprint, jsonify, request
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from bson import ObjectId
from datetime import datetime, timedelta


report_bp = Blueprint("report", __name__)

# ==============================
# 1️⃣ BÁO CÁO KẾT QUẢ THEO ĐỀ
# ==============================
@report_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_exam_results(exam_id):
    db = get_db()
    exam_oid = ObjectId(exam_id)

    exam = db.exams.find_one({
        "_id": exam_oid,
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}), 404

    results = list(db.results.find({"exam_id": exam_oid}))

    formatted = []

    for r in results:
        formatted.append({
            "student_id": str(r["student_id"]),
            "score": r.get("score", 0),
            "total": r.get("total", 0),
            "point": r.get("point"),
            "submitted_at": r.get("submitted_at")
        })

    return jsonify(formatted), 200


# ==============================
# 2️⃣ BÁO CÁO THEO HỌC SINH
# ==============================
@report_bp.route("/student/<student_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_student_results(student_id):
    db = get_db()

    student_oid = ObjectId(student_id)

    results = list(db.results.find({"student_id": student_oid}))

    formatted = []

    for r in results:
        formatted.append({
            "exam_id": str(r["exam_id"]),
            "score": r.get("score", 0),
            "total": r.get("total", 0),
            "point": r.get("point"),
            "submitted_at": r.get("submitted_at")
        })

    return jsonify(formatted), 200


# ==============================
# 3️⃣ BÁO CÁO GIAN LẬN THEO ĐỀ
# ==============================
@report_bp.route("/cheat/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_cheat_exam(exam_id):
    db = get_db()
    exam_oid = ObjectId(exam_id)

    pipeline = [
        {"$match": {"exam_id": exam_oid}},
        {"$group": {
            "_id": "$student_id",
            "count": {"$sum": 1}
        }}
    ]

    data = list(db.cheat_logs.aggregate(pipeline))

    result = [
        {
            "student_id": str(d["_id"]),
            "cheat_count": d["count"]
        }
        for d in data
    ]

    return jsonify(result), 200


# ==============================
# 4️⃣ BÁO CÁO TỔNG HỢP ĐỀ THI
# ==============================
@report_bp.route("/exam/<exam_id>/summary", methods=["GET"])
@token_required
@role_required("teacher")
def exam_summary(exam_id):
    db = get_db()
    exam_oid = ObjectId(exam_id)

    # Kiểm tra đề có tồn tại và thuộc giáo viên này không
    exam = db.exams.find_one({
        "_id": exam_oid,
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}), 404

    results = list(db.results.find({"exam_id": exam_oid}))
    cheat_logs = list(db.cheat_logs.find({"exam_id": exam_oid}))

    # ===== TẠO MAP GIAN LẬN =====
    cheat_map = {}

    for log in cheat_logs:
        sid = str(log["student_id"])
        action = log.get("action", "unknown")

        cheat_map.setdefault(sid, {})
        cheat_map[sid][action] = cheat_map[sid].get(action, 0) + 1

    formatted_results = []

    for r in results:
        sid = str(r["student_id"])

        profile = db.student_profiles.find_one({
            "user_id": ObjectId(sid)
        })

        # 🔥 LUÔN CÓ {} nếu không gian lận
        cheat_actions = cheat_map.get(sid, {})
        cheat_total = sum(cheat_actions.values())

        formatted_results.append({
            "exam_name": exam.get("exam_name"),
            "student_id": sid,
            "student_name": profile["full_name"] if profile else "Chưa cập nhật",
            "student_code": profile.get("student_code") if profile else "",
            "score": r.get("score", 0),
            "total": r.get("total", 0),
            "point": r.get("point"),
            "cheats": cheat_actions,        # 🔥 QUAN TRỌNG
            "cheat_total": cheat_total,     # 🔥 TỔNG SỐ VI PHẠM
            "is_cancelled": r.get("is_cancelled", False),
            "submitted_at": r.get("submitted_at")
        })

    return jsonify({
        "total_students": len(formatted_results),
        "results": formatted_results
    }), 200

# ==============================
# 5️⃣ TEACHER DASHBOARD SUMMARY
# ==============================
@report_bp.route("/teacher/summary", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_dashboard_summary():
    db = get_db()
    teacher_id = request.user["_id"]

    class_count = db.classes.count_documents({"teacher_id": teacher_id})
    exam_count = db.exams.count_documents({"teacher_id": teacher_id})
    question_count = db.questions.count_documents({})

    return jsonify({
        "classes": class_count,
        "exams": exam_count,
        "questions": question_count
    }), 200


# ==============================
# 6️⃣ STUDENT DASHBOARD SUMMARY
# ==============================
@report_bp.route("/student/summary", methods=["GET"])
@token_required
@role_required("student")
def student_dashboard_summary():
    db = get_db()
    student_id = request.user["_id"]

    class_count = db.class_members.count_documents({"student_id": student_id})
    exam_done = db.results.count_documents({"student_id": student_id})

    results = list(db.results.find({"student_id": student_id}))

    if results:
        total_point = 0

        for r in results:
            score = r.get("score", 0)
            total = r.get("total", 0)
            point = r.get("point")

            if point is None:
                point = round((score / total) * 10, 1) if total > 0 else 0

            total_point += point

        avg_score = round(total_point / len(results), 2)
    else:
        avg_score = 0

    return jsonify({
        "classes": class_count,
        "exams_done": exam_done,
        "avg_score": avg_score
    }), 200
# ==============================
# 7️⃣ BÁO CÁO KẾT QUẢ THEO LỚP
@report_bp.route("/class/<class_id>", methods=["GET"])
@token_required
@role_required("teacher")
def report_by_class(class_id):
    db = get_db()

    exams = list(db.exams.find({"class_id": ObjectId(class_id)}))
    exam_ids = [e["_id"] for e in exams]

    results = list(db.results.find({
        "exam_id": {"$in": exam_ids}
    }))

    cheat_logs = list(db.cheat_logs.find({
        "exam_id": {"$in": exam_ids}
    }))

    # ===== TẠO MAP GIAN LẬN =====
    cheat_map = {}

    for log in cheat_logs:
        sid = str(log["student_id"])
        action = log.get("action", "unknown")

        cheat_map.setdefault(sid, {})
        cheat_map[sid][action] = cheat_map[sid].get(action, 0) + 1

    formatted = []

    for r in results:
        sid = str(r["student_id"])

        profile = db.student_profiles.find_one({
            "user_id": r["student_id"]
        })

        cheat_actions = cheat_map.get(sid, {})
        cheat_total = sum(cheat_actions.values())

        formatted.append({
           "student_name": profile["full_name"] if profile else "Unknown",
            "point": r.get("point", 0),
            "cheat_total": cheat_total,
            "cheats": cheat_actions,
            "submitted_at": r.get("submitted_at"),
            "is_cancelled": r.get("is_cancelled", False)   # ✅ THÊM DÒNG NÀY
        })

    return jsonify({
        "results": formatted
    }), 200
# ==============================
# 8️⃣ DANH SÁCH SINH VIÊN THI / VẮNG
# ==============================

@report_bp.route("/exam-attendance/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def exam_attendance(exam_id):

    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id),
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}),404

    class_id = exam["class_id"]

    # Lấy tất cả sinh viên của lớp
    members = list(db.class_members.find({
        "class_id": class_id
    }))

    student_ids = [m["student_id"] for m in members]

    students = list(db.users.find({
        "_id": {"$in": student_ids}
    }))

    # Lấy danh sách đã thi
    results = list(db.results.find({
        "exam_id":ObjectId(exam_id)
    }))

    result_student_ids = [r["student_id"] for r in results]

    data = []

    for s in students:

        status = "absent"

        if s["_id"] in result_student_ids:
            status = "present"

        profile = db.student_profiles.find_one({
            "user_id": s["_id"]
        })

        data.append({

            "student_id": str(s["_id"]),

            "student_code": profile.get("student_code") if profile else "",

            "name": profile.get("full_name") if profile else "Chưa cập nhật",

            "gender": profile.get("gender") if profile else "",

            "email": s.get("email"),

            "subject": exam.get("exam_name"),

            "status": status
        })

    return jsonify(data)
# ==============================
# 8️⃣ STUDENT DASHBOARD
# ==============================

@report_bp.route("/student/dashboard", methods=["POST"])
@token_required
@role_required("student")
def student_dashboard():

    db = get_db()
    student_id = request.user["_id"]

    data = request.json
    class_id = data.get("class_id")

    if not class_id:
        return jsonify({"results": []})

    # Lấy tất cả exam của lớp
    exams = list(db.exams.find({
        "class_id": ObjectId(class_id)
    }))

    exam_ids = [e["_id"] for e in exams]

    # Lấy kết quả của sinh viên
    results = list(db.results.find({
        "exam_id": {"$in": exam_ids},
        "student_id": student_id
    }))

    formatted = []

    for r in results:

        exam = db.exams.find_one({"_id": r["exam_id"]})

        cheat_count = db.cheat_logs.count_documents({
            "exam_id": r["exam_id"],
            "student_id": student_id
        })

        formatted.append({

            "subject": exam.get("exam_name", "Unknown"),

            "point": r.get("point", 0),

            "cheat_total": cheat_count,

            "submitted_at": r.get("submitted_at")

        })

    # Tìm môn điểm cao nhất
    best_subject = None
    if formatted:
        best = max(formatted, key=lambda x: x["point"])
        best_subject = best["subject"]

    return jsonify({
        "results": formatted,
        "best_subject": best_subject
    }), 200