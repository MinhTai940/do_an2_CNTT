from config.database import get_db
from models.user_model import user_schema
from werkzeug.security import generate_password_hash, check_password_hash

def register_user(data):
    db = get_db()

    if db.users.find_one({"username": data["username"]}):
        return None, "User already exists"

    user = user_schema(data)
    user["password"] = generate_password_hash(user["password"])

    db.users.insert_one(user)
    return user, None


def login_user(data):
    db = get_db()
    user = db.users.find_one({"username": data["username"]})

    if not user:
        return None

    if not check_password_hash(user["password"], data["password"]):
        return None

    return user