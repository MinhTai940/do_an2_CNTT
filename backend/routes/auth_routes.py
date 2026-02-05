from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user
from utils.jwt_helper import generate_token

auth_bp = Blueprint("auth", __name__)
#AIP đăng ký người dùng
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    user, error = register_user(data)

    if error:
        return jsonify({"message": error}), 400

    return jsonify({"message": "Register successful"}), 201
#API đăng nhập người dùng
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = login_user(data)

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user)   # ✅ TRUYỀN NGUYÊN USER

    return jsonify({
        "token": token,
        "role": user["role"]
    }), 200
