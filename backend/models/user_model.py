def user_schema(data):
    return {
        "username": data.get("username"),
        "password": data.get("password"),
        "role": data.get("role"),  # teacher | student
        "status": "active"
    }
