from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from bson import ObjectId
from flask_cors import cross_origin
from docx import Document
import re
from datetime import datetime


exam_bp = Blueprint("exam", __name__)

# ==========================
# HELPER SERIALIZER
# ==========================
def serialize_exam(e):
    return {
        "_id": str(e["_id"]),
        "exam_name": e.get("exam_name"),
        "duration": e.get("duration"),
        "class_id": str(e["class_id"]) if e.get("class_id") else None,
        "teacher_id": str(e["teacher_id"]) if e.get("teacher_id") else None,
        "status": e.get("status", "active"),
        "mode": e.get("mode", "easy"),
        "shuffle_questions": e.get("shuffle_questions", False),
        "shuffle_answers": e.get("shuffle_answers", False),
        "open_time": e.get("open_time").isoformat() if e.get("open_time") else None,
        "close_time": e.get("close_time").isoformat() if e.get("close_time") else None
    }

# ==========================
# API 1 – GIÁO VIÊN TẠO ĐỀ
# ==========================
@exam_bp.route("/create", methods=["POST"])
@token_required
@role_required("teacher")
def create_exam():

    db = get_db()
    data = request.json

    open_time = data.get("open_time")
    close_time = data.get("close_time")

    # parse open_time
    if open_time:
        try:
            open_time = datetime.fromisoformat(open_time)
        except:
            open_time = None
    else:
        open_time = None

    # parse close_time
    if close_time:
        try:
            close_time = datetime.fromisoformat(close_time)
        except:
            close_time = None
    else:
        close_time = None

    new_exam = {
        "exam_name": data.get("exam_name"),
        "class_id": ObjectId(data.get("class_id")),
        "duration": data.get("duration"),
        "teacher_id": request.user["_id"],
        "status": "active",
        "mode": data.get("mode", "easy"),
        "open_time": open_time,
        "close_time": close_time,
        "shuffle_questions": data.get("shuffle_questions", False),
        "shuffle_answers": data.get("shuffle_answers", False)
    }

    result = db.exams.insert_one(new_exam)

    return jsonify({
        "message": "Exam created successfully",
        "exam_id": str(result.inserted_id)
    }), 201


# ==========================
# API 2 – GIÁO VIÊN LẤY ĐỀ THEO LỚP
# ==========================
@exam_bp.route("/teacher/class/<class_id>", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_get_exams_by_class(class_id):

    db = get_db()

    exams = list(db.exams.find({
        "class_id": ObjectId(class_id),
        "teacher_id": request.user["_id"]
    }))

    result = [serialize_exam(e) for e in exams]

    return jsonify(result), 200


# ==========================
# API 3 – HỌC SINH LẤY ĐỀ THEO LỚP
# ==========================
@exam_bp.route("/student/class/<class_id>", methods=["GET"])
@token_required
@role_required("student")
def student_get_exams_by_class(class_id):

    db = get_db()

    exams = list(db.exams.find({
        "class_id": ObjectId(class_id),
        "status": "active"
    }))

    result = []

    for exam in exams:

        now = datetime.utcnow()

        is_closed = False
        is_upcoming = False

        if exam.get("open_time") and now < exam["open_time"]:
            is_upcoming = True

        if exam.get("close_time") and now > exam["close_time"]:
            is_closed = True

        result.append({
            "_id": str(exam["_id"]),
            "exam_name": exam.get("exam_name"),
            "duration": exam.get("duration"),
            "mode": exam.get("mode", "easy"),
            "open_time": exam.get("open_time").isoformat() if exam.get("open_time") else None,
            "close_time": exam.get("close_time").isoformat() if exam.get("close_time") else None,
            "is_closed": is_closed,
            "is_upcoming": is_upcoming
        })

    return jsonify(result), 200


# ==========================
# API 4 – GIÁO VIÊN XEM CHI TIẾT ĐỀ
# ==========================
@exam_bp.route("/<exam_id>", methods=["GET"])
@token_required
@role_required("teacher")
def teacher_get_exam_detail(exam_id):

    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id),
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam not found"}), 404

    return jsonify(serialize_exam(exam)), 200


# ==========================
# API 5 – HỌC SINH XEM CHI TIẾT
# ==========================
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

    now = datetime.utcnow()

    if exam.get("open_time") and now < exam["open_time"]:
        return jsonify({
            "message": "Chưa tới giờ mở đề"
        }), 403

    if exam.get("close_time") and now > exam["close_time"]:
        return jsonify({
            "message": "Đề thi đã đóng"
        }), 403

    return jsonify({
        "_id": str(exam["_id"]),
        "exam_name": exam["exam_name"],
        "duration": exam["duration"],
        "mode": exam.get("mode", "easy"),
        "open_time": exam.get("open_time").isoformat() if exam.get("open_time") else None,
        "close_time": exam.get("close_time").isoformat() if exam.get("close_time") else None
    }), 200


# ==========================
# API 6 – SỬA ĐỀ THI
# ==========================
@exam_bp.route("/<exam_id>", methods=["PUT"])
@token_required
@role_required("teacher")
def update_exam(exam_id):

    db = get_db()
    data = request.json

    result = db.exams.update_one(
        {
            "_id": ObjectId(exam_id),
            "teacher_id": request.user["_id"]
        },
        {
            "$set": {
                "exam_name": data.get("exam_name"),
                "duration": data.get("duration"),
                "open_time": datetime.fromisoformat(data.get("open_time")) if data.get("open_time") else None,
                "close_time": datetime.fromisoformat(data.get("close_time")) if data.get("close_time") else None
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"message": "Exam not found"}), 404

    return jsonify({"message": "Exam updated successfully"}), 200


# ==========================
# API 7 – XOÁ ĐỀ
# ==========================
@exam_bp.route("/<exam_id>", methods=["DELETE"])
@token_required
@role_required("teacher")
def delete_exam(exam_id):

    db = get_db()

    db.exams.delete_one({
        "_id": ObjectId(exam_id),
        "teacher_id": request.user["_id"]
    })

    db.questions.delete_many({
        "exam_id": ObjectId(exam_id)
    })

    return jsonify({"message": "Đã xóa đề thi"}), 200


# ==========================
# API 8 – TÌM KIẾM
# ==========================
@exam_bp.route("/teacher/search", methods=["GET"])
@token_required
@role_required("teacher")
def search_exam():

    db = get_db()
    keyword = request.args.get("q", "")

    exams = list(db.exams.find({
        "teacher_id": request.user["_id"],
        "exam_name": {"$regex": keyword, "$options": "i"}
    }))

    result = [serialize_exam(e) for e in exams]

    return jsonify(result), 200


# ==========================
# API 9 – UPLOAD WORD
# ==========================
@exam_bp.route("/upload-word/<exam_id>", methods=["POST"])
@token_required
@role_required("teacher")
@cross_origin(origin="http://localhost:3000")
def upload_word_exam(exam_id):

    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id),
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}), 404

    if "file" not in request.files:
        return jsonify({"message": "Không có file"}), 400

    file = request.files["file"]

    if not file.filename.endswith(".docx"):
        return jsonify({"message": "Chỉ chấp nhận file .docx"}), 400

    try:

        doc = Document(file)
        text = "\n".join([p.text for p in doc.paragraphs])

        pattern = r"Câu\s*\d+:(.*?)A\.(.*?)B\.(.*?)C\.(.*?)D\.(.*?)Đáp án.*?:\s*([A-D])"
        matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)

        if not matches:
            return jsonify({"message": "File sai định dạng"}), 400

        inserted_count = 0

        for m in matches:

            question = m[0].strip()
            options = [m[1].strip(), m[2].strip(), m[3].strip(), m[4].strip()]
            correct_letter = m[5].upper()
            correct_index = ["A", "B", "C", "D"].index(correct_letter)

            db.questions.insert_one({
                "exam_id": ObjectId(exam_id),
                "content": question,
                "options": options,
                "correct_index": correct_index
            })

            inserted_count += 1

        return jsonify({
            "message": "Upload thành công",
            "total_questions": inserted_count
        }), 200

    except Exception as e:
        print("UPLOAD ERROR:", e)

        return jsonify({
            "message": "Lỗi xử lý file",
            "error": str(e)
        }), 500