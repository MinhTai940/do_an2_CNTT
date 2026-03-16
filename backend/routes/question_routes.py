from flask import Blueprint, request, jsonify
from config.database import get_db
from utils.jwt_required import token_required
from utils.role_required import role_required
from bson import ObjectId
import random

question_bp = Blueprint("question", __name__)

# ==========================
# HELPER SERIALIZER
# ==========================
def serialize_question_teacher(q):
    return {
        "_id": str(q["_id"]),
        "exam_id": str(q["exam_id"]),
        "content": q.get("content"),
        "options": q.get("options"),
        "correct_index": q.get("correct_index"),
        "level": q.get("level", "medium")
    }

def serialize_question_student(q):
    return {
        "_id": str(q["_id"]),
        "content": q.get("content"),
        "options": q.get("options")
    }

# ==========================
# API 1 – GIÁO VIÊN TẠO CÂU HỎI
# ==========================
@question_bp.route("/create", methods=["POST"])
@token_required
@role_required("teacher")
def create_question():
    db = get_db()
    data = request.json

    exam = db.exams.find_one({
        "_id": ObjectId(data.get("exam_id")),
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}), 404

    question = {
        "exam_id": ObjectId(data.get("exam_id")),
        "content": data.get("content"),
        "options": data.get("options"),
        "correct_index": data.get("correct_index"),
        "level": data.get("level", "medium")
    }

    db.questions.insert_one(question)

    return jsonify({"message": "Question added successfully"}), 201


# ==========================
# API 2 – HỌC SINH LẤY CÂU HỎI
# ==========================
@question_bp.route("/exam/<exam_id>", methods=["GET"])
@token_required
@role_required("student")
def get_questions_by_exam(exam_id):

    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id)
    })

    questions = list(db.questions.find({
        "exam_id": ObjectId(exam_id)
    }))

    # 🔀 ĐẢO CÂU HỎI
    if exam.get("shuffle_questions"):
        random.shuffle(questions)

    # 🔀 ĐẢO ĐÁP ÁN
    if exam.get("shuffle_answers"):

        for q in questions:

            options = q["options"]
            correct = q["correct_index"]

            combined = list(enumerate(options))
            random.shuffle(combined)

            new_options = []
            new_correct = 0

            for new_index, (old_index, opt) in enumerate(combined):

                new_options.append(opt)

                if old_index == correct:
                    new_correct = new_index

            q["options"] = new_options
            q["correct_index"] = new_correct

    result = [serialize_question_student(q) for q in questions]

    return jsonify(result), 200

# ==========================
# API 3 – GIÁO VIÊN QUẢN LÝ CÂU HỎI
# ==========================
@question_bp.route("/exam/<exam_id>/teacher", methods=["GET"])
@token_required
@role_required("teacher")
def get_questions_by_exam_teacher(exam_id):
    db = get_db()

    exam = db.exams.find_one({
        "_id": ObjectId(exam_id),
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Exam không tồn tại"}), 404

    questions = list(db.questions.find({
        "exam_id": ObjectId(exam_id)
    }))

    result = [serialize_question_teacher(q) for q in questions]

    return jsonify(result), 200


# ==========================
# API 4 – SỬA CÂU HỎI
# ==========================
@question_bp.route("/<question_id>", methods=["PUT"])
@token_required
@role_required("teacher")
def update_question(question_id):
    db = get_db()
    data = request.json

    question = db.questions.find_one({"_id": ObjectId(question_id)})

    if not question:
        return jsonify({"message": "Question not found"}), 404

    exam = db.exams.find_one({
        "_id": question["exam_id"],
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Không có quyền sửa"}), 403

    db.questions.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {
            "content": data.get("content"),
            "options": data.get("options"),
            "correct_index": data.get("correct_index"),
            "level": data.get("level", "medium")
        }}
    )

    return jsonify({"message": "Cập nhật câu hỏi thành công"}), 200


# ==========================
# API 5 – XOÁ CÂU HỎI
# ==========================
@question_bp.route("/<question_id>", methods=["DELETE"])
@token_required
@role_required("teacher")
def delete_question(question_id):
    db = get_db()

    question = db.questions.find_one({"_id": ObjectId(question_id)})

    if not question:
        return jsonify({"message": "Question not found"}), 404

    exam = db.exams.find_one({
        "_id": question["exam_id"],
        "teacher_id": request.user["_id"]
    })

    if not exam:
        return jsonify({"message": "Không có quyền xoá"}), 403

    db.questions.delete_one({"_id": ObjectId(question_id)})

    return jsonify({"message": "Đã xóa câu hỏi"}), 200