from flask import Blueprint, request, jsonify
from utils.jwt_helper import generate_token
from config.database import get_db
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

auth_bp = Blueprint("auth", __name__)

# ===================== REGISTER =====================
@auth_bp.route("/register", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:3000")
def register():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json or {}
    db = get_db()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Thiếu email hoặc mật khẩu"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"message": "Email đã tồn tại"}), 400

    user = {
        "email": email,
        "password": generate_password_hash(password),
        "role": "student",
        "is_profile_completed": False
    }

    db.users.insert_one(user)

    return jsonify({"message": "Đăng ký thành công"}), 201


# ===================== LOGIN =====================
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:3000")
def login():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json or {}
    db = get_db()

    # 👉 Nhận email HOẶC username (tránh KeyError)
    email = data.get("email") or data.get("username")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Thiếu email hoặc mật khẩu"}), 400

    user = db.users.find_one({"email": email})

    if not user:
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401
    # 🔴 CHẶN TÀI KHOẢN BỊ KHOÁ
    if user.get("status", "active") == "inactive":
        return jsonify({"message": "Tài khoản đã bị khoá"}), 403
     # ✅ CẬP NHẬT THỜI GIAN ĐĂNG NHẬP
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    token = generate_token(user)

    return jsonify({
        "token": token,
        "role": user["role"],
        "is_profile_completed": user.get("is_profile_completed", False)
    }), 200
